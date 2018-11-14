/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";
    import tooltip = powerbi.extensibility.utils.tooltip;

    interface ITooltipServiceWrapper {
        addTooltip<T>(selection: d3.Selection<any>, getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[], getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId, reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
    }

    //import tooltip = powerbi.extensibility.utils.tooltip;
    import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
    import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

    import IColorPalette = powerbi.extensibility.IColorPalette;
    


    export class Visual implements IVisual {
        
        private host: IVisualHost;
        private tooltipServiceWrapper: ITooltipServiceWrapper; 
        private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        private colorPalete: IColorPalette;
        
        

        constructor(options: VisualConstructorOptions) {
            options.element.style.overflow = 'auto';
            this.host = options.host;
            //debugger;
            tooltip.createTooltipServiceWrapper(
            options.host.tooltipService,
            options.element);
            let bodyElement = d3.select("body");

            let element = bodyElement
                .append("div")
                .style({
                    "background-color": "green",
                    "width": "150px",
                    "height": "150px"
                })
                .classed("visual", true)
                .data([{
                    tooltipInfo: [{
                        displayName: "Power BI",
                        value: 2016
                    }]
                }]);
            
            /*let tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, bodyElement.data[0]); // tooltipService is from the IVisualHost.
            
            tooltipServiceWrapper.addTooltip<TooltipEnabledDataPoint>(element, (eventArgs: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                return eventArgs.data.tooltipInfo;
            });*/
            
            console.log('Visual constructor', options);
            this.target = options.element;
            //this.updateCount = 0;
            if (typeof document !== "undefined") {
                /*
                const new_p: HTMLElement = document.createElement("p");
                new_p.appendChild(document.createTextNode("Update count:"));
                const new_em: HTMLElement = document.createElement("em");
                this.textNode = document.createTextNode(this.updateCount.toString());
                new_em.appendChild(this.textNode);
                new_p.appendChild(new_em);
                this.target.appendChild(new_p);
                */
                const new_div: HTMLElement = document.createElement("div");
                new_div.id="div_arbol";
                this.target.appendChild(new_div);


                let tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, new_div); // tooltipService is from the IVisualHost.
            
            tooltipServiceWrapper.addTooltip<TooltipEnabledDataPoint>(element, (eventArgs: TooltipEventArgs<TooltipEnabledDataPoint>) => {
                return eventArgs.data.tooltipInfo;
            });


                /*
                this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
                this.tooltipServiceWrapper.addTooltip(null, 
                    (tooltipEvent: TooltipEventArgs<number>) => Visual.getTooltipData(tooltipEvent.data),
                    (tooltipEvent: TooltipEventArgs<number>) => null);
                */            
            }
                
        }
        
        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            return [{
                displayName: value.category,
                value: value.value.toString(),
                color: value.color
            }];
        }

        private arcRadius : number;
        private arcBaseColorStr : string;
        private arcColorOK : string;
        private linkColor : string;
        private arcColorKO : string;
        private arcExpandMode : boolean;

        private autoExpandTree : boolean;
        private allMemberName : string;
        private weigthLinks : boolean;
        private nodeTextSize:number;

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            try {
                this.arcBaseColorStr = options.dataViews[0].metadata.objects.treeOptions.arcBaseColor["solid"]["color"];                 
            } catch(e) {}

            try {
                this.arcColorOK = options.dataViews[0].metadata.objects.treeOptions.arcCumplimientoOK["solid"]["color"];                 
            } catch(e) {}

            try {
                this.linkColor = options.dataViews[0].metadata.objects.treeOptions.linkColor["solid"]["color"];                 
            } catch(e) {}

            try {
                this.arcColorKO = options.dataViews[0].metadata.objects.treeOptions.arcCumplimientoKO["solid"]["color"];                 
            } catch(e) {}

            try {
                //this.arcBaseColorStr = options.dataViews[0].metadata.objects.treeOptions.arcBaseColor.toString();
                //this.autoExpandTree = options.dataViews[0].metadata.objects["treeOptions"]["autoExpandTree"] == 'true';                
                this.autoExpandTree = options.dataViews[0].metadata.objects["treeOptions"]["autoExpandTree"] == true;                
            } catch(e) {
                //this.autoExpandTree = true;
            }
            try {
                //this.arcBaseColorStr = options.dataViews[0].metadata.objects.treeOptions.arcBaseColor.toString();
                //this.autoExpandTree = options.dataViews[0].metadata.objects["treeOptions"]["autoExpandTree"] == 'true';                
                this.allMemberName = options.dataViews[0].metadata.objects["treeOptions"]["allMemberName"].toString();                
            } catch(e) {
                //this.autoExpandTree = true;
            }

            try {
                this.arcRadius = parseInt(options.dataViews[0].metadata.objects["treeOptions"]["arcRadius"].toString());                 
            } catch(e) {}

            try {
                //this.arcBaseColorStr = options.dataViews[0].metadata.objects.treeOptions.arcBaseColor.toString();
                //this.autoExpandTree = options.dataViews[0].metadata.objects["treeOptions"]["autoExpandTree"] == 'true';                
                this.arcExpandMode = options.dataViews[0].metadata.objects["treeOptions"]["expandMode"] == true;                
            } catch(e) {
                //this.autoExpandTree = true;
            }
            try {
                this.weigthLinks = options.dataViews[0].metadata.objects["treeOptions"]["weightLinks"] == true;                
            }catch(e){

            }

            try {
                this.nodeTextSize = parseInt(options.dataViews[0].metadata.objects["treeOptions"]["nodeTextSize"].toString());                 
            } catch(e) {
                this.nodeTextSize=15;
            }

            

            console.log('Visual update', options);
            //debugger;

            var div_height = this.target.offsetHeight, div_width = this.target.offsetWidth;
            if(options.type != 36) {
                if (d3.select("svg")){
                    d3.select("svg").remove();
                }
                //inicializarArbol(div_height,div_width,options.dataViews[0].table);
                //debugger;
                if(div_height-20>0)div_height=div_height-20
                inicializarArbol(div_height,div_width,options,this.host);
            }
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            var color = this.arcBaseColorStr;
            if (!color) color = "lightsteelblue";

            var colorOk = this.arcColorOK;
            if (!colorOk) colorOk = "green";

            var linColor = this.linkColor;
            if (!linColor) linColor="lightgray"

            var colorKo = this.arcColorKO;
            if (!colorKo) colorKo = "red";

            var radius = this.arcRadius;
            if (!radius) radius = 15;


            var autoexp = this.autoExpandTree;
            if (autoexp == undefined) autoexp = true;
            var allmem = this.allMemberName;
            if(!allmem) allmem = "All";
            
            var expMode = this.arcExpandMode;
            if (expMode== undefined) expMode = true;
            //debugger;

            var wLinks = this.weigthLinks;
            if (wLinks==undefined) wLinks = true;

            var nTextSize = this.nodeTextSize;
            if (nTextSize==undefined) nTextSize=15;

            switch (objectName) {
                case 'treeOptions':
                  objectEnumeration.push({
                    objectName: objectName,
                    properties: {
                        autoExpandTree: autoexp,
                        expandMode : expMode,
                        weightLinks: wLinks,
                        allMemberName: allmem,
                        nodeTextSize:nTextSize,
                        
                        arcRadius : radius,
                        
                        arcBaseColor: color,
                        arcCumplimientoOK: colorOk,
                        arcCumplimientoKO: colorKo,
                        linkColor: linColor
                        
                    },
                    selector: null
                  });
                  break;
              };

            return objectEnumeration;
        }
    }
}