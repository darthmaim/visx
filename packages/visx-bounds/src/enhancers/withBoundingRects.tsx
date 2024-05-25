/* eslint react/no-did-mount-set-state: 0, react/no-find-dom-node: 0 */
import React from 'react';
import ReactDOM from 'react-dom';

const emptyRect = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
};

type rectShape = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

type WithBoundingRectsState = {
  rect?: rectShape;
  parentRect?: rectShape;
};

type WithBoundingRectsInternalProps = {
  getRects?: () => { rect: rectShape; parentRect: rectShape };
  nodeRef?: React.RefObject<HTMLElement>;
};

type WithBoundingRectsProvidedProps = WithBoundingRectsInternalProps & WithBoundingRectsState;

export type WithBoundingRectsProps = WithBoundingRectsProvidedProps;

type WithBoundingRectsComponentProps<P extends WithBoundingRectsProvidedProps> = Omit<
  P,
  keyof WithBoundingRectsProvidedProps
>;

export default function withBoundingRects<Props extends WithBoundingRectsProvidedProps>(
  BaseComponent: React.ComponentType<Props>,
): React.ComponentClass<WithBoundingRectsComponentProps<Props>> {
  return class WrappedComponent extends React.Component<
    WithBoundingRectsComponentProps<Props>,
    WithBoundingRectsState
  > {
    static displayName = `withBoundingRects(${BaseComponent.displayName || ''})`;
    state = {
      rect: undefined,
      parentRect: undefined,
    };
    node: HTMLElement | undefined | null;
    nodeRef: React.RefObject<HTMLElement>;
    constructor(props: WithBoundingRectsComponentProps<Props>) {
      super(props);
      this.nodeRef = React.createRef();
      this.getRects = this.getRects.bind(this);
    }

    componentDidMount() {
      this.node = this.nodeRef?.current
        ? this.nodeRef.current
        : (ReactDOM.findDOMNode(this) as HTMLElement);
      this.setState(() => this.getRects());
    }

    getRects() {
      if (!this.node) return this.state;

      const { node } = this;
      const parentNode = node.parentNode as HTMLElement | null;

      const rect = node.getBoundingClientRect ? node.getBoundingClientRect() : emptyRect;

      const parentRect = parentNode?.getBoundingClientRect
        ? parentNode.getBoundingClientRect()
        : emptyRect;

      return { rect, parentRect };
    }

    render() {
      return (
        <BaseComponent
          nodeRef={this.nodeRef}
          getRects={this.getRects}
          {...this.state}
          {...(this.props as Props)}
        />
      );
    }
  };
}
