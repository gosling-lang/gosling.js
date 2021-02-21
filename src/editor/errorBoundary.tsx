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
                    <h1>Sorry, something went wrong. </h1>
                    <h3>Please refresh your page to restart the editor.</h3>
                    <h3>
                        It would be great if you can report this in
                        <a href="https://github.com/gosling-lang/gosling.js/issues/171"> our github issues</a>.
                    </h3>
                </div>
            );
        }
        return this.props.children;
    }
}
