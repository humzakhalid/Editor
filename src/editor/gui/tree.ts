import 'jstree';

export interface TreeNode {
    id: string;
    text: string;

    img?: string;
    data?: any;

    parent?: string;
    children?: string[];

    state?: {
		checked?: boolean;
	};
}

export interface ContextMenuItem {
    id: string;
    text: string;
    multiple?: boolean;
    callback: (node: TreeNode) => void | Promise<void>;

    separatorBefore?: boolean;
    separatorAfter?: boolean;
    img?: string;
}

export default class Tree {
    // Public members
    public name: string;
    public wholerow: boolean = false;
    public keyboard: boolean = false;
    public multipleSelection: boolean = false;
    public element: JSTree = null;

    public onClick: <T>(id: string, data: T) => void;
    public onDblClick: <T>(id: string, data: T) => void;

    public onRename: <T>(id: string, name: string, data: T) => boolean;

    public onContextMenu: <T>(id: string, data: T) => ContextMenuItem[];
    public onMenuClick: <T>(id: string, node: TreeNode) => void;

    public onCanDrag: <T>(id: string, data: T) => boolean;
    public onDrag:<T, U>(node: T, parent: U) => boolean;

    public onCopy: <T>(source: TreeNode, target: TreeNode, parent: T) => T;

    // Protected members
    protected currentSelectedNode: string = '';
    protected moving: boolean = false;
    protected renaming: boolean = false;
    protected isFocused: boolean = false;

    // Static members
    public static Instances: Tree[] = [];

    /**
     * Returns if at least one code editor is focused
     */
    public static HasOneFocused (): boolean {
		for (const i of this.Instances) {
			if (i.isFocused)
				return true;
		}

		return false;
	}

    /**
     * Constructor
     * @param name the tree name 
     */
    constructor (name: string) {
        this.name = name;
    }

    /**
     * Clear the tree
     * @param root: the root node from where to remove children. If undefined, root is taken
     */
    public clear (root?: string): void {
        this.element.jstree().delete_node(this.element.jstree().get_node(root || '#').children);
    }

    /**
     * Adds the given node to the tree
     * @param node: the node to add into the tree
     * @param parent: the optional parent of the node
     */
    public add (node: TreeNode, parent?: string): TreeNode {
        const id = this.element.jstree().create_node(parent || '#', {
            id: node.id,
            text: node.text,
            data: node.data,
            icon: node.img ? ('w2ui-icon ' + node.img) : 'w2ui-icon icon-error'
        });

        return this.element.jstree().get_node(id);
    }

    /**
     * Deletes the given node
     * @param id the id of the node
     */
    public remove (id: string): void {
        this.element.jstree().delete_node(id);
    }

    /**
     * Selects the given node
     * @param id the id of the node to select
     */
    public select (id: string): void {
        if (id !== this.currentSelectedNode) {
            this.currentSelectedNode = id;

            this.element.jstree().deselect_all(true);
            this.element.jstree().select_node(id, true);
        }
    }

    /**
     * Returns the selected node
     */
    public getSelected (): TreeNode {
        const id = this.element.jstree().get_selected()[0];
        if (!id)
            return null;

        return this.element.jstree().get_node(id);
    }

    /**
     * Returns all the selected nodes
     */
    public getAllSelected (): TreeNode[] {
        const ids = this.element.jstree().get_selected();
        return ids.map(id => this.get(id));
    }

    /**
     * Get the given node
     * @param id the id of the node to get
     */
    public get (id: string): TreeNode {
        return this.element.jstree().get_node(id);
    }

    /**
     * Renames the given node
     * @param id the node's id
     * @param name the new name of the node
     */
    public rename (id: string, name: string): void {
        this.renaming = true;
        this.element.jstree('rename_node', id, name);
        this.renaming = false;
    }

    /**
     * Expands the given node
     * @param id the id of the node to expand
     */
    public expand (id: string): void {
        this.element.jstree('open_node', id);
    }

    /**
     * Returns nodes count currently drawn
     */
    public getNodesCount (): number {
        return this.element.jstree().get_json('#', { flat: true }).length;
    }

    /**
     * Set parent of the given node (id)
     * @param id the id of the node
     * @param parentId the parent id
     */
    public setParent (id: string, parentId: string): void {
        const node = this.get(id);
        if (!node)
            return;

        const parent = this.get(parentId);
        if (!parent)
            return;

        this.moving = true;
        this.element.jstree().move_node(node, parent);
        this.moving = false;

        this.expand(parentId);
    }

    /**
     * Search nodes fitting the given value
     * @param value the value to search
     */
    public search (value: string): void {
        this.element.jstree().search(value);
    }

    /**
     * Destroys the tree
     */
    public destroy (): void {
        this.element.destroy(false);

        this.onClick = null;
        this.onDblClick = null;

        this.onContextMenu = null;
        this.onMenuClick = null;

        this.onCanDrag = null;
        this.onDrag = null;
    }

    /**
     * Builds the tree
     * @param parentId the parent id
     */
    public build (parentId: string): void {
        const plugins = [
            'contextmenu', 'dnd', 'search',
            'state', 'types'
        ];

        if (this.wholerow)
            plugins.push('wholerow')

        if (this.keyboard)
            plugins.push('hotkeys');

        this.element = $('#' + parentId).jstree({
            core: {
                check_callback: true,
                multiple: this.multipleSelection
            },
            dnd : {
                use_html5 : true,
                is_draggable : (nodes: TreeNode[]) => {
                    const node = nodes[0];
                    return this.onCanDrag && this.onCanDrag(node.id, node.data);
                }
            },
            plugins: plugins,
            search: {
                show_only_matches: true,
                show_only_matches_children: true
            },
            contextmenu: {
                items: () => {
                    if (!this.onContextMenu)
                        return null;

                    const lastSelected = this.getSelected(); // Last selected

                    if (!lastSelected)
                        return null;
                    
                    const items = this.onContextMenu(lastSelected.id, lastSelected.data);
                    const result = { };

                    items.forEach(i => {
                        result[i.id] = {
                            label: i.text,
                            icon: i.img ? ('w2ui-icon ' + i.img) : undefined,
                            action: async () => {
                                if (!i.multiple)
                                    return await i.callback(lastSelected);

                                const selected = this.getAllSelected();
                                for (const n of selected) {
                                    await i.callback(n);
                                }
                            },
                            separator_before: i.separatorBefore,
                            separator_after: i.separatorAfter
                        }
                    });
                    
                    return result;
                }
            }
        });

        // Events
        this.element
            .on('changed.jstree', (e, data) => {
                if (data.action === 'select_node' && this.onClick)
                    this.onClick(data.node.id, data.node.data);
            })
            .on('rename_node.jstree', (e, data) => {
                if (data.old === data.text || this.renaming || !this.onRename)
                    return;

                const renamed = this.onRename(data.node.id, data.text, data.node.data);
                if (!renamed)
                    this.rename(data.node.id, data.old);
            })
            .on('copy_node.jstree', (e, data) => {
                const parent = this.get(data.node.parent);
                if (!this.onCopy || !this.onCopy(data.original, data.node, parent.data))
                    this.remove(data.node.id);

                this.element.jstree().set_id(data.node, data.node.id);
            })
            .on('move_node.jstree', (e, data) => {
                if (!this.onDrag || this.moving)
                    return;
                
                const node = data.node;
                const parent = this.get(data.parent);

                if (!node || !parent)
                    return;

                const success = this.onDrag(node.data, parent.data);

                // Revert ?
                if (!success)
                    this.setParent(node.id, data.old_parent);
            });

            this.element.dblclick(() => {
                if (this.onDblClick) {
                    const node = this.getSelected();
                    this.onDblClick(node.id, node.data);
                }
            });

        this.element.focusin(() => this.isFocused = true);
        this.element.focusout(() => this.isFocused = false);

        // Register instance
        Tree.Instances.push(this);
    }
}
