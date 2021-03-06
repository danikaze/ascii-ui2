export interface Event<N extends Node = Node> {
  target: N;
  stopPropagation: () => void;
  stopImmediatePropagation: () => void;
}

export type EventHandler = <T extends Event<N>, N extends Node = Node>(
  event: T
) => void;

export interface EventAttached extends Event {
  /** Attached node  */
  node: Node;
}
export interface EventDettached extends Event {
  /** Dettached node  */
  node: Node;
}
export interface EventAdopted extends Event {
  /**
   * If the adopted node had a different parent before, this is it
   * (new parent will be already in node.parent)
   */
  oldParent: Node;
}
export interface EventOrphaned extends Event {
  /** Previous parent of the orphaned node */
  oldParent: Node;
}

export interface NodeOptions<C extends Node = Node, P extends Node = Node> {
  /** If specified, the new node will be attached to the parent in the constructor */
  parent?: P;
  /** If specified, the list of children will be attached to the node in the constructor */
  children?: C[];
}

export class Node<C extends Node = BasicNode, P extends Node = BasicNode> {
  /** Current parent, if any, of the node */
  protected parent?: P;
  /** List of childrens of the node */
  protected children: C[] = [];
  /** List of event handlers listening to each event type */
  private readonly listeners = new Map<string, EventHandler[]>();

  constructor(options: NodeOptions<C, P> = {}) {
    if (options.parent) {
      options.parent.append(this);
    }

    if (options.children) {
      for (const child of options.children) {
        this.append(child);
      }
    }
  }

  /**
   * Retrieve the parent of the Node, if any
   */
  public getParent(): P | undefined {
    return this.parent;
  }

  /**
   * Get a list of the children attached to the Node.
   * Can be empty
   */
  public getChildren(): C[] {
    return this.children;
  }

  /**
   * Insert a children into the current node, in the specified position
   */
  public insert(node: C, index: number): void {
    const oldParent = node.parent;
    if (oldParent) {
      node.parent!.remove(node);
    }
    this.children.splice(index, 0, node);
    node.parent = this;
    this.emit('attach', { node });
    node.emit('adopt', { oldParent });
  }

  /**
   * Insert a children as the first one
   */
  public prepend(node: C): void {
    this.insert(node, 0);
  }

  /**
   * Insert a children as the last one
   */
  public append(node: C): void {
    this.insert(node, this.children.length);
  }

  /**
   * Dettach a children from the node.
   * If it's not found, does nothing
   */
  public remove(node: C): void {
    const index = this.children.indexOf(node);
    if (index === -1) return;

    this.children.splice(index, 1);
    node.parent = undefined;
    this.emit('dettach', { node });
    node.emit('orphan', { oldParent: this });
  }

  /**
   * Listen to a type of events.
   * Accepts several types separated by spaces or commas
   */
  public on(eventTypes: string, handler: EventHandler): void {
    eventTypes.split(/ +|,+/).forEach(type => {
      let listeners = this.listeners.get(type);
      if (!listeners) {
        listeners = [];
        this.listeners.set(type, listeners);
      }
      listeners.push(handler);
    });
  }

  /**
   * Removes an even listener.
   * If not found, does nothing.
   * Accepts several types separated by spaces or commas
   */
  public off(eventTypes: string, handler: EventHandler): void {
    eventTypes.split(/ +,+/).forEach(type => {
      const listeners = this.listeners.get(type);
      if (!listeners) return;

      const i = listeners.indexOf(handler);
      if (i === -1) return;

      listeners.splice(i, 1);
    });
  }

  /**
   * Remove all registered listeners if the specified event type.
   * If the eventType is not specified, it will remove all of them.
   * Accepts several types separated by spaces or commas
   */
  public clearListeners(eventTypes?: string): void {
    if (!eventTypes) {
      return this.listeners.clear();
    }

    eventTypes.split(/ +,+/).forEach(type => {
      this.listeners.delete(type);
    });
  }

  /**
   * Emits an event, which will be propagated to all the parent hierarchy unless it's
   * cancelled via`event.stopPropagation` (other listeners in that node will still receive the event)
   * To avoid the remaining listeners to receive the event, use `stopImmediatePropagation`
   */
  public emit<D extends {}>(eventType: string, data?: D): void {
    // tslint:disable-next-line: no-this-assignment
    let el: Node | undefined = this;
    let stop = false;
    let stopImmediate = false;
    const stopPropagation = () => (stop = true);
    const stopImmediatePropagation = () => (stopImmediate = true);
    const extendedData = {
      ...data,
      stopPropagation,
      stopImmediatePropagation,
      target: this,
    };

    do {
      const listeners = el.listeners.get(eventType);
      if (listeners) {
        for (const listener of listeners) {
          listener(extendedData);
          if (stopImmediate) {
            return;
          }
        }
      }
      el = el.parent;
    } while (el && !stop);
  }
}

interface BasicNode extends Node<BasicNode, BasicNode> {}
