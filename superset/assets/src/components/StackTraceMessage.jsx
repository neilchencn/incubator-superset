/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Collapse } from 'react-bootstrap';

const propTypes = {
  message: PropTypes.string,
  queryResponse: PropTypes.object,
  showStackTrace: PropTypes.bool,
};
const defaultProps = {
  showStackTrace: false,
};

class StackTraceMessage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showStackTrace: props.showStackTrace,
      height: 500,
    };
  }

  /**
     * Add event listener
     */
  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  /**
     * Remove event listener
     */
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  hasTrace() {
    return this.props.queryResponse && this.props.queryResponse.stacktrace;
  }

  /**
     * Calculate & Update state of new dimensions
     */
  updateDimensions() {
    if (this.state.showStackTrace) {
      this.setState({ height: window.innerHeight - 250 });
    }
  }

  render() {
    return (
      <div
        className={`stack-trace-container${this.hasTrace() ? ' has-trace' : ''}`}
      >
        <Alert
          bsStyle="warning"
          onClick={() =>
            this.setState({
              showStackTrace: !this.state.showStackTrace,
              height: window.innerHeight - 250,
            })}
        >
          {this.props.message}
        </Alert>
        {this.hasTrace() &&
          <Collapse in={this.state.showStackTrace}>
            <div>
              <pre style={{ height: this.state.height || 500 }}>
                {this.props.queryResponse.stacktrace}
              </pre>
            </div>
          </Collapse>}
      </div>
    );
  }
}

StackTraceMessage.propTypes = propTypes;
StackTraceMessage.defaultProps = defaultProps;

export default StackTraceMessage;
