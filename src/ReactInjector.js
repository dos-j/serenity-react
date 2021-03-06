import {createElement, Component} from 'react';
import serenity from 'serenitydi';

function getPropsFromInjectables(injectables) {

  const injectKeys = Object.keys(injectables);
  const injectVals = serenity.fetchAll(injectKeys.map(key => injectables[key]));

  const newProps = injectVals.reduce((newProps, dep1, index) => {
    newProps[injectKeys[index]] = dep1;
    return newProps;
  }, {});

  return newProps;
}

export default function(WrappedComponent, injectables) {

  return class ReactInjectorComponent extends Component {

    constructor(props) {
      super(props);
      this.propsToInject = getPropsFromInjectables(injectables);
      this.onUpdate = this.onUpdate.bind(this);
    }

    componentDidMount() {
      Object.keys(this.propsToInject).forEach(item => {
        const dependency = this.propsToInject[item];

        if (typeof dependency.subscribe === 'function') {
          dependency.subscribe(this.onUpdate);
        }
      });    
    }

    onUpdate(data) {
      this.setState({
        ...this.props,
        ...data
      });
    }

    render() {

      return createElement(WrappedComponent, {
       ...this.props,
       ...this.propsToInject
     }); 
    }
  };
}



