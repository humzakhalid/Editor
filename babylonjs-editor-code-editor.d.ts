// Generated by dts-bundle v0.7.3
// Dependencies for this module:
//   ../../../babylonjs
//   ../../../babylonjs-editor

declare module 'babylonjs-editor-code-editor' {
    import CodeProjectEditor, { Script } from 'babylonjs-editor-code-editor/project-editor';
    export default CodeProjectEditor;
    export { Script };
}

declare module 'babylonjs-editor-code-editor/project-editor' {
    import { Scene } from 'babylonjs';
    import Editor, { Layout } from 'babylonjs-editor';
    import CodeGraph from 'babylonjs-editor-code-editor/graph';
    import CodeLayout from 'babylonjs-editor-code-editor/code-layout';
    import CodeEditorToolbar from 'babylonjs-editor-code-editor/toolbar';
    /**
        * Script interface that all editable scripts should follow
        */
    export interface Script {
            id: string;
            name: string;
            code: string;
            compiledCode: string;
    }
    export default class CodeProjectEditor {
            editor: Editor;
            scene: Scene;
            scripts: Script[];
            layout: Layout;
            graph: CodeGraph;
            codeLayout: CodeLayout;
            toolbar: CodeEditorToolbar;
            /**
                * Constructor
                * @param editor the editor reference
                */
            constructor(editor: Editor);
            /**
                * Creates the code editor
                */
            create(): Promise<void>;
            /**
                * Resizes the code editor
                */
            resize(): void;
            /**
                * Refreshes the code editor
                */
            refresh(): void;
    }
}

declare module 'babylonjs-editor-code-editor/graph' {
    import { Tree } from "babylonjs-editor";
    import CodeProjectEditor from "babylonjs-editor-code-editor/project-editor";
    export default class CodeGraph {
            codeEditor: CodeProjectEditor;
            tree: Tree;
            scriptsRoot: string;
            postProcessesRoot: string;
            static Uid: number;
            /**
                * Constructor
                * @param codeEditor the code editor reference
                */
            constructor(codeEditor: CodeProjectEditor);
            /**
                * Fills the graph
                */
            fill(): void;
    }
}

declare module 'babylonjs-editor-code-editor/code-layout' {
    import { ResizableLayout, IStringDictionary } from "babylonjs-editor";
    import CodeProjectEditor, { Script } from 'babylonjs-editor-code-editor/project-editor';
    import CodeEdit from "babylonjs-editor-code-editor/code-editor";
    export interface OpenedCodeEditor {
            editor: CodeEdit;
            script: Script;
    }
    export default class CodeLayout {
            codeEditor: CodeProjectEditor;
            layout: ResizableLayout;
            openedCodeEditors: IStringDictionary<OpenedCodeEditor>;
            /**
                * Constructor
                * @param codeEditor the code editor reference
                */
            constructor(codeEditor: CodeProjectEditor);
            /**
                * Creates the resizable layout
                */
            create(): Promise<void>;
            /**
                * Opens a new code editor
                * @param script the code to modify
                */
            openCode(script: Script): Promise<void>;
            /**
                * Closes the code editor identified by the given Id
                * @param codeId the code if to close
                */
            closeCode(codeId: string): void;
            /**
                * Updates the typings
                */
            updateTypings(): void;
    }
}

declare module 'babylonjs-editor-code-editor/toolbar' {
    import { Toolbar } from 'babylonjs-editor';
    import CodeProjectEditor from 'babylonjs-editor-code-editor/project-editor';
    export default class CodeEditorToolbar {
            codeEditor: CodeProjectEditor;
            toolbar: Toolbar;
            /**
                * Constructor
                * @param codeEditor the code editor reference
                */
            constructor(codeEditor: CodeProjectEditor);
            /**
                * Once the user clicks on a menu of the main toolbar
                * @param target the target element
                */
            protected onClick(target: string): Promise<void>;
    }
}

declare module 'babylonjs-editor-code-editor/code-editor' {
    import { CodeEditor } from 'babylonjs-editor';
    import CodeProjectEditor, { Script } from 'babylonjs-editor-code-editor/project-editor';
    export default class CodeEdit {
            codeEditor: CodeProjectEditor;
            code: CodeEditor;
            onClose: () => void;
            onChange: () => void;
            /**
                * Constructor
                * @param codeEditor the code editor reference
                */
            constructor(codeEditor: CodeProjectEditor);
            /**
                * Creates the code editor
                */
            create(code: Script): Promise<void>;
    }
}

