import React from 'react';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css'

type IReactJsoneditor = {
    values: any,
    onChange: (value: any) => void
}

class ReactJsoneditor extends React.Component<IReactJsoneditor, {}> {

    editor: JSONEditor;
    options: JSONEditorOptions;
    container: React.RefObject<HTMLDivElement>

    constructor(props: any) {
        super(props);
        this.container = React.createRef();
    }

    componentWillReceiveProps(nextProps: any) {
        let editorValues = this.editor.get()
        if (
            JSON.stringify(this.props.values) !== JSON.stringify(nextProps.values) &&
            JSON.stringify(editorValues) !== JSON.stringify(nextProps.values)
        ) {
            this.editor.set(nextProps.values)
            this.editor.expandAll()
        }
    }

    componentDidMount() {
        this.options = {
            onChange: () => {
                if (this.props.onChange) {
                    let newValues = this.editor.get()
                    this.props.onChange(newValues)
                }
            }
        }
        if (this.container.current) {
            this.editor = new JSONEditor(this.container.current, this.options)
            this.editor.set(this.props.values)
            this.editor.expandAll()
        }

    }

    render() {
        return (
            <div className="react-json-editor-wrapper" ref={this.container} />
        )
    }
}

export default ReactJsoneditor;
