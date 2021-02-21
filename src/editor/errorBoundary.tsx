import React from 'react';

interface State {
    hasError: boolean;
}

interface Props {}
export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch() {
        // Display fallback UI
        this.setState({ hasError: true });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ margin: '10px 40px' }}>
                    <h3>Sorry, something went wrong. </h3>
                    <li>
                        <h4>Please refresh your page to restart the editor.</h4>
                    </li>
                    <li>
                        <h4>
                            Please help us fix this issue by submitting a{' '}
                            <a
                                href="https://github.com/gosling-lang/gosling.js/issues/new"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub issue
                            </a>{' '}
                            with the code on the left.
                        </h4>
                    </li>
                </div>
            );
        }
        return this.props.children;
    }
}
