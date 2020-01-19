export interface Event {
  stopPropagation: () => void;
  stopImmediatePropagation: () => void;
}

export type EventHandler = <T extends Event>(event: T) => void;

export interface EventAttached extends Event {
  node: Node;
}
export interface EventAdopted extends Event {
  oldParent: Node;
}
export interface EventDettached extends Event {
  node: Node;
}
export interface EventOrphaned extends Event {
  oldParent: Node;
}

export interface NodeOptions {
  parent?: Node;
  children?: Node[];
}

export class Node {
  protected readonly listeners = new Map<string, EventHandler[]>();
  protected parent?: Node;
  protected children: Node[] = [];

  constructor(options: NodeOptions = {}) {
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
  public getParent(): Node | undefined {
    return this.parent;
  }

  /**
   * Get a list of the children attached to the Node.
   * Can be empty
   */
  public getChildren(): Node[] {
    return this.children;
  }

  /**
   * Insert a children into the current node, in the specified position
   */
  public insert(node: Node, index: number): void {
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
  public prepend(node: Node): void {
    this.insert(node, 0);
  }

  /**
   * Insert a children as the last one
   */
  public append(node: Node): void {
    this.insert(node, this.children.length);
  }

  /**
   * Dettach a children from the node.
   * If it's not found, does nothing
   */
  public remove(node: Node): void {
    const index = this.children.indexOf(node);
    if (index === -1) return;

    this.children.splice(index, 1);
    node.parent = undefined;
    this.emit('dettach', { node });
    node.emit('orphan', { oldParent: this });
  }

  /**
   * Listen to a type of events
   */
  public on(eventType: string, handler: EventHandler): void {
    let listeners = this.listeners.get(eventType);
    if (!listeners) {
      listeners = [];
      this.listeners.set(eventType, listeners);
    }
    listeners.push(handler);
  }

  /**
   * Removes an even listener
   * If not found, does nothing
   */
  public off(eventType: string, handler: EventHandler): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return;

    const i = listeners.indexOf(handler);
    if (i === -1) return;

    listeners.splice(i, 1);
  }

  /**
   * Remove all registered listeners if the specified event type
   * If the eventType is not specified, it will remove all of them
   */
  public clearListeners(eventType?: string): void {
    if (!eventType) {
      return this.listeners.clear();
    }

    this.listeners.delete(eventType);
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
