import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

const propTypes = {
    onCancel: PropTypes.func,
    open: PropTypes.bool
};

const defaultProps = {
    onCancel: e => e.preventDefault()
};

class Dialog extends React.Component {
    componentDidMount() {
        this.refs.dialog.addEventListener('cancel', this.props.onCancel);
        if (this.props.open) {
            findDOMNode(this).showModal();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.open !== prevProps.open) {
            if (this.props.open) {
                findDOMNode(this).showModal();

                // display the dialog at the right location
                // needed for the polyfill, otherwise it's not at the right position
/*
                const bodyHeight = document.body.clientHeight;
                const dialogHeight = this.refs.dialog.clientHeight;
                this.refs.dialog.style.position = 'fixed';
                this.refs.dialog.style.top = `${(bodyHeight - dialogHeight) / 2}px`;
*/
            } else {
                findDOMNode(this).close();
            }
        }
    }

    componentWillUnmount() {
        this.refs.dialog.removeEventListener('cancel', this.props.onCancel);
    }

    render() {
        const { open, onCancel, children, ...otherProps } = this.props;

        return (
            <dialog ref="dialog" className='mdl-dialog' {...otherProps}>
                {children}
            </dialog>
        );
    }
}

Dialog.propTypes = propTypes;
Dialog.defaultProps = defaultProps;

export default Dialog;