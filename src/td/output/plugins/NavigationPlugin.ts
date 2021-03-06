module td.output
{
    /**
     * A plugin that exposes the navigation structure of the documentation
     * to the rendered templates.
     *
     * The navigation structure is generated using the current themes
     * [[BaseTheme.getNavigation]] function. This plugins takes care that the navigation
     * is updated and passed to the render context.
     */
    export class NavigationPlugin extends RendererPlugin
    {
        /**
         * The navigation structure generated by the current theme.
         */
        navigation:NavigationItem;


        /**
         * Create a new NavigationPlugin instance.
         *
         * @param renderer  The renderer this plugin should be attached to.
         */
        constructor(renderer:Renderer) {
            super(renderer);
            renderer.on(Renderer.EVENT_BEGIN, this.onRendererBegin, this);
            renderer.on(Renderer.EVENT_BEGIN_PAGE, this.onRendererBeginPage, this);
        }


        /**
         * Triggered before the renderer starts rendering a project.
         *
         * @param event  An event object describing the current render operation.
         */
        private onRendererBegin(event:OutputEvent) {
            this.navigation = this.renderer.theme.getNavigation(event.project);
        }


        /**
         * Triggered before a document will be rendered.
         *
         * @param page  An event object describing the current render operation.
         */
        private onRendererBeginPage(page:OutputPageEvent) {
            var currentItems:NavigationItem[] = [];
            (function updateItem(item:NavigationItem) {
                item.isCurrent = false;
                item.isInPath  = false;
                item.isVisible = item.isGlobals;

                if (item.url == page.url || (item.dedicatedUrls && item.dedicatedUrls.indexOf(page.url) != -1)) {
                    currentItems.push(item);
                }

                if (item.children) {
                    item.children.forEach((child) => updateItem(child));
                }
            })(this.navigation);

            currentItems.forEach((item:NavigationItem) => {
                item.isCurrent = true;

                var depth = item.isGlobals ? -1 : 0;
                var count = 1;
                while (item) {
                    item.isInPath  = true;
                    item.isVisible = true;

                    count += 1;
                    depth += 1;
                    if (item.children){
                        count += item.children.length;
                        if (depth < 2 || count < 30) {
                            item.children.forEach((child) => {
                                child.isVisible = true
                            });
                        }
                    }

                    item = item.parent;
                }
            });

            page.navigation = this.navigation;
        }
    }


    /**
     * Register this plugin.
     */
    Renderer.registerPlugin('navigation', NavigationPlugin);
}
