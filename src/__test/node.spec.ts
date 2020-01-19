import { describe, it } from 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { Node } from '../node';

describe('Node', () => {
  it('Create a Node without parent nor children', () => {
    const node = new Node({});
    assert.isUndefined(node.getParent());
    assert.isEmpty(node.getChildren());
  });

  it('Create a Node with parent and children in the params', () => {
    const parent = new Node();
    const children = [new Node()];
    const adoptedListener = sinon.spy(() => {});
    const attachedListener = sinon.spy(() => {});

    children[0].on('adopt', adoptedListener);
    parent.on('attach', attachedListener);
    const node = new Node({ parent, children });

    assert.strictEqual(node.getParent(), parent);
    assert.deepEqual(node.getChildren(), children);
    sinon.assert.calledOnce(adoptedListener);
    // attach on node will bubble up to parent, so twice:
    sinon.assert.calledTwice(attachedListener);
  });

  it('Insert and remove children in arbitrary positions', () => {
    const node = new Node();
    const node1 = new Node();
    const node2 = new Node();
    const node3 = new Node();
    const node4 = new Node();
    const node5 = new Node();
    const node6 = new Node();

    // tslint:disable: no-magic-numbers
    assert.deepEqual(node.getChildren(), []);
    assert.isUndefined(node3.getParent());
    node.append(node3);
    assert.strictEqual(node3.getParent(), node);
    assert.deepEqual(node.getChildren(), [node3]);
    node.insert(node2, 0);
    assert.deepEqual(node.getChildren(), [node2, node3]);
    node.insert(node5, 3);
    assert.deepEqual(node.getChildren(), [node2, node3, node5]);
    node.prepend(node1);
    assert.deepEqual(node.getChildren(), [node1, node2, node3, node5]);
    node.append(node6);
    assert.deepEqual(node.getChildren(), [node1, node2, node3, node5, node6]);
    node.insert(node4, 3);
    assert.deepEqual(node.getChildren(), [
      node1,
      node2,
      node3,
      node4,
      node5,
      node6,
    ]);
    node.insert(node1, 1);
    assert.deepEqual(node.getChildren(), [
      node2,
      node1,
      node3,
      node4,
      node5,
      node6,
    ]);

    node.remove(node1);
    assert.deepEqual(node.getChildren(), [node2, node3, node4, node5, node6]);
    node.remove(node1);
    assert.deepEqual(node.getChildren(), [node2, node3, node4, node5, node6]);
  });

  it('Can add and remove event listeners', () => {
    const node = new Node();
    const listener1 = sinon.spy(() => {});
    const listener2 = sinon.spy(() => {});
    const listener3 = sinon.spy(() => {});

    node.on('test', listener1);
    node.on('test', listener2);
    node.off('test', listener1);
    node.off('test', listener3);
    node.off('unknown', listener3);

    node.emit('test');

    sinon.assert.notCalled(listener1);
    sinon.assert.calledOnce(listener2);
    sinon.assert.notCalled(listener3);
  });

  it('Should propagate events through parents, not children', () => {
    const node = new Node();
    const parent1 = new Node();
    const parent2 = new Node();
    const parent3 = new Node();
    const child = new Node();
    parent3.append(parent2);
    parent2.append(parent1);
    parent1.append(node);
    node.append(child);

    const parent3Listener = sinon.spy(() => {});
    const parent1Listener = sinon.spy(() => {});
    const nodeListener1 = sinon.spy(() => {});
    const nodeListener2 = sinon.spy(() => {});
    const childListener = sinon.spy(() => {});

    parent3.on('test', parent3Listener);
    parent1.on('test', parent1Listener);
    node.on('test', nodeListener1);
    node.on('test', nodeListener2);
    child.on('test', childListener);

    node.emit('test', { data: 123 });

    sinon.assert.calledOnce(nodeListener1);
    sinon.assert.calledOnce(nodeListener2);
    sinon.assert.calledOnce(parent1Listener);
    sinon.assert.calledOnce(parent3Listener);
    sinon.assert.notCalled(childListener);
  });

  it('Events should be cancellable', () => {
    const node = new Node();
    const parent1 = new Node();
    const parent2 = new Node();
    const child = new Node();
    parent2.append(parent1);
    parent1.append(node);
    node.append(child);

    const parent2Listener = sinon.spy(() => {});
    const parent1Listener = sinon.spy(({ stopPropagation }) =>
      stopPropagation()
    );
    const nodeListener1 = sinon.spy(() => {});
    const nodeListener2 = sinon.spy(() => {});
    const childListener = sinon.spy(() => {});

    parent2.on('test', parent2Listener);
    parent1.on('test', parent1Listener);
    node.on('test', nodeListener1);
    node.on('test', nodeListener2);
    child.on('test', childListener);

    node.emit('test', { data: 123 });

    sinon.assert.calledOnce(nodeListener1);
    sinon.assert.calledOnce(nodeListener2);
    sinon.assert.calledOnce(parent1Listener);
    sinon.assert.notCalled(parent2Listener);
    sinon.assert.notCalled(childListener);
  });

  it('Events should be cancellable instantly', () => {
    const node = new Node();
    const parent = new Node();
    parent.append(node);

    const parentListener = sinon.spy(() => {});
    const listener1 = sinon.spy(() => {});
    const listener2 = sinon.spy(({ stopImmediatePropagation }) =>
      stopImmediatePropagation()
    );
    const listener3 = sinon.spy(() => {});

    parent.on('test', parentListener);
    node.on('test', listener1);
    node.on('test', listener2);
    node.on('test', listener3);

    node.emit('test', { data: 123 });

    sinon.assert.calledOnce(listener1);
    sinon.assert.calledOnce(listener2);
    sinon.assert.notCalled(parentListener);
    sinon.assert.notCalled(listener3);
  });
});
