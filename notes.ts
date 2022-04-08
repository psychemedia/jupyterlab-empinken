// TO CHASE: https://discourse.jupyter.org/t/styling-cells-through-metadata/4978/23?u=psychemedia

// Most of the code cribbed from @krassowski
// https://stackoverflow.com/questions/71736749/accessing-notebook-cell-metadata-and-html-class-attributes-in-jupyterlab-extensi/71744107?noredirect=1#comment126807644_71744107


// Testing this in:
// https://github.com/jupyterlab/jupyterlab-plugin-playground

import { IDisposable, DisposableDelegate } from '@lumino/disposable';

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  NotebookActions,
  NotebookPanel,
  INotebookModel,
} from '@jupyterlab/notebook';

/**
 * The plugin registration information.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'toolbar-button',
  autoStart: true,
};

/*
The most relevant docs appear to be:
https://jupyterlab.readthedocs.io/en/stable/api/modules/notebook.notebookactions.html

*/
export class ClassDemoExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
    /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const notebook = panel.content;
    
    function check_code_tags(notebook){
        /*
        Iterate through all the cells
        If we see a cell with a tag that starts with class-
        then add a corresponding tag to differnt elements in the
        notebook HTML DOM
        */
        for (const cell of notebook.widgets) {
            let tagList = cell.model.metadata.get('tags') as string[];
            if (tagList) {
              for (let i = 0; i < tagList.length; i++) {
                var tag = tagList[i];
                if (tag.startsWith("class-")) {
                    /* 
                    The plugin playground extension is rather hostile 
                    to have-a-go end-user devs (it's rather strict in 
                    its Javascript epxectations) so if you don't 
                    declare things with let, const or var then an 
                    error of the following form is likely to be thrown 
                    that stops further execution:
                    
                    ReferenceError: class_name is not defined
                    */

                    //This will replace just the first instance
                    const class_name = tag.replace("class-", "tag-")
                    
                    // Add class tags to various parts of the DOM
                    console.log("Cell type: " + cell.model.type)
                    console.log("Try node...")
                    cell.node.classList.add(class_name + "-" + cell.model.type + "-node");
                    console.log("Try inputArea.node...")
                    cell.inputArea.node.classList.add(class_name + "-" + cell.model.type + "-inputArea_node");
                    console.log("Try editor.node...")
                    cell.editor.host.classList.add(class_name + "-" + cell.model.type + "-editor_host");
                    console.log("Try .inputArea.promptNode...")
                    cell.inputArea.promptNode.classList.add(class_name + "-" + cell.model.type + "-inputArea_promptNode");
                    if (cell.model.type=="markdown") {
                        //console.log("Try RenderedHTMLCommon.node...")
                        //cell.RenderedHTMLCommon.node.classList.add(class_name + "-" + cell.model.type + "-RenderedHTMLCommon.node")
                        //TO DO - access lm-Widget p-Widget jp-RenderedHTMLCommon jp-RenderedMarkdown jp-MarkdownOutput
                        // DOESN'T WORK: cell.MarkdownOutput.node, MarkdownOutput.host, RenderedMarkdown.node, RenderedHTMLCommon.node
                    }
                    else {
                        console.log("Try outputArea.node...")
                        cell.outputArea.node.classList.add(class_name + "-" + cell.model.type + "-outputArea_node")
                    }
                    //console.log("Try inputWrapper.prompt...")
                    //cell.inputWrapper.prompt.node.classList.add(class_name + "-" + cell.model.type + "-inputWrapper_node");
                }
              }
            }
        }
    }
    
    notebook.modelChanged.connect((notebook) => {
        console.log("I think we're changed");
        // This doesn't seem to do anything on notebook load
        // iterate cells and toggle DOM classes as needed, e.g.
        //check_code_tags(notebook);
        
    });
        
    notebook.fullyRendered.connect((notebook) => {
        // I don't think this means fully rendered on a cells becuase it seems
        // like we try to add the tags mutliple times on notebook load
        // which is really inefficient.
        // This may be unstable anyway, eg the following comment:
        // https://stackoverflow.com/questions/71736749/accessing-notebook-cell-metadata-and-html-class-attributes-in-jupyterlab-extensi/71744107?noredirect=1#comment126807644_71744107
        // I'll with go with in now in the expectation it will be break
        // and I will hopefully be able to find another even to fire from.
        // I get the impression the UI is some some of signal hell and
        // the solution is just to keep redoing things on everything
        // if anything changes. Who needs efficiency...
        console.log("I think we're fullyRendered");
        // iterate cells and toggle DOM classes as needed, e.g.
        check_code_tags(notebook);
    });
    
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}
/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  /**
   * Create a new extension for the notebook panel widget.
   *
   * @param panel Notebook panel
   * @param context Notebook context
   * @returns Disposable on the added button
   */
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const notebook = panel.content;
    
    function check_tags2(notebook){
        for (const cell of notebook.widgets) {
            let tagList = cell.model.metadata.get('tags') as string[];
            if (tagList) {
              for (let i = 0; i < tagList.length; i++) {
                var tag = tagList[i];
                if tag.startsWith("style-")
                    cell.node.classList.add(tag.replace("style-", "tag-"));
                else if tag.startsWith("directive-")
                    cell.node.classList.add(tag);
              }
            }
        }
    }
    function check_tags(notebook){
        //DEPRECATED
        // When we have a new notebook, class appropriately tagged cells
        for (const cell of notebook.widgets) {
            const tags2 = cell.model.metadata.get('tags')
            // I have no idea what sort of object tags2 is
        console.log("XX-"+tags2+"-YY");
        if (tags2) {
            console.log('we have tags...')
            if tags2.includes('dsd-sd') {
                console.log('new tags hit')
                cell.node.classList.add('NEWadmonition-titleTEST');
            }
            
            console.log("tagtype "+typeof tags2 +".."+typeof tags2.toString())
            const tag_str = tags2.toString();
            console.log("tagstr "+tag_str)
            const taglist = tag_str.split(",")
            console.log("taglist "+taglist)
            for (const i in taglist) {
                const tag = taglist[i]
                console.log("splitted-"+tag)
                if tag.startsWith("style-")
                    cell.node.classList.add(tag.replace("style-", "tag-"));
                else if tag.startsWith("directive-")
                    cell.node.classList.add(tag);
            }
 
        }  else
            console.log('new tags-miss')
        }
    }
        
    notebook.fullyRendered.connect((notebook) => {
        console.log("I think we're loaded");
        // iterate cells and toggle DOM classes as needed, e.g.
        check_tags2(notebook);
    });
    
    notebook.modelChanged.connect((notebook) => {
        
        
    });
    const myButtonAction = () => {
      // Perform some action
        console.log("here");
        const notebook = panel.content;
        const activeCell = notebook.activeCell;
        if (activeCell.model.type === 'markdown') {
           activeCell.node.classList.toggle('admonition-title');
            activeCell.node.classList.add('admonition-titleTEST');
            // We can track down to specific areas
            activeCell.inputArea.node.classList.add('CHILD-titleTEST');
        }
        const tags1 = activeCell.model.metadata.get('someMetaData');
        console.log(tags1);
        
        const tags2 = activeCell.model.metadata.get('tags')
        let tagList = activeCell.model.metadata.get('tags') as string[];
        //can we set metadata?
        if !(tagList.includes("TESTTAG"))
            tagList.push("TESTTAG")
        
        //We can also toggle tags
        // This seems to work at the data level
        // but is not reflected in the tags toolbar.
        // sometimes it lags, 
        // sometimes it just appears to be wrong?
        // I don't see why I should have to go through
        // the crappy metadata widget? I just want to
        // readwrite the actual cell metadata
        // if it's in metadata remove it
        if (tagList.includes("TOGGLETAG")) {
            console.log("I see TOGGLETAG")
            const index = tagList.indexOf("TOGGLETAG", 0);
            if (index > -1) {
               tagList.splice(index, 1);
            }
        }
        // else add it
        else {
            console.log("I don't see TOGGLETAG")
            tagList.push("TOGGLETAG")
        }
        activeCell.model.metadata.set('test1',"TEST1")
        console.log(tags2);
        if !(typeof tags2 === 'undefined')
            if tags2.includes('dsd-sd')
                console.log('tags hit')
        else
            console.log('tags-miss')
        
        
        // I'm minded to toggle the class attributes
        // here as well...
        
        // What about if multiple cells are selected?
    };

    const button = new ToolbarButton({
      className: 'my-action-button',
      label: 'A', //activity (A), solution (S), learner (L), tutor (T)
      //iconClass: 'fa fa-exclamation-circle',
      //https://github.com/jupyterlab/jupyterlab/issues/8277
      onClick: myButtonAction,
      tooltip: 'Perform My Button action',
    });

    panel.toolbar.insertItem(10, 'myNewAction', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

/**
 * Activate the extension.
 *
 * @param app Main application object
 */
function activate(app: JupyterFrontEnd): void {
  //app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
  app.docRegistry.addWidgetExtension('Notebook', new ClassDemoExtension());
}

/**
 * Export the plugin as default.
 */
export default plugin;
