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
            options.element.style.overflowX = 'auto';
            this.host = options.host;            
            this.target = options.element;            
            if (typeof document !== "undefined") {                
                const new_div: HTMLElement = document.createElement("div");
                new_div.id="div_arbol";
                this.target.appendChild(new_div);

                
            }

            //wellcome page
            const wellcome_div : HTMLElement = document.createElement("div");
            wellcome_div.id="wellcome_div";
            wellcome_div.innerHTML="<p style='font-size:25px'>PIE CHARTS TREE (1.0.3)</p>";
            //wellcome_div.innerHTML+="<p>Sponsored by:</p>";
            //wellcome_div.innerHTML+="<div style='position:relative;left:100px;height:100px;width:100px;background-color:black;color:white;'><div style='text-align:center;position:absolute;top:40px'><p style='height:100px;width:100px;margin:0;padding:0;'>WANTED</p></div></div>";
            
            wellcome_div.innerHTML+="<p style='font-weight: bolder;'>Put an attribute in the Categories field to start the tree...<br/></p>";
            wellcome_div.innerHTML+="<p>Created by Aritz Francoy</p>";
            wellcome_div.innerHTML+="<p>Contributors: Sergio Álvaro Panizo, Eduardo Valladolid, Mohammed Suhel</p>";
            this.target.appendChild(wellcome_div);
                
        }
        
        private isResizing :boolean = false;       
        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            var div_height = this.target.offsetHeight, div_width = this.target.offsetWidth;
            var hasCategories = false;
            for(var i =0; i< options.dataViews[0].metadata.columns.length; i++){
                hasCategories = !options.dataViews[0].metadata.columns[i].isMeasure;
                if(hasCategories)break;
            } 
            
            if(hasCategories){
                if(this.isResizing && options.type==36) {
                    this.isResizing=false;
                    document.getElementById("wellcome_div").style.display="none";
                    if (d3.select("svg")){
                        d3.select("svg").remove();
                    }
                    if(div_height-20>0)div_height=div_height-20;
                    inicializarArbol(div_height,div_width,options,this.host,this.settings);
                }
                else  
                if(options.type != 36) {
                    if (options.type == 4) this.isResizing=true;
                    else {
                        document.getElementById("wellcome_div").style.display="none";
                        if (d3.select("svg")){
                            d3.select("svg").remove();
                        }
                        if(div_height-20>0)div_height=div_height-20;
                        inicializarArbol(div_height,div_width,options,this.host,this.settings);
                    }   
                }
                
            } else {
                if (d3.select("svg")){
                    d3.select("svg").remove();
                }
                document.getElementById("wellcome_div").style.display="block";
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
            const vSettings:VisualSettings=this.settings || VisualSettings.getDefault() as VisualSettings
            
            return VisualSettings.enumerateObjectInstances(vSettings,options);
        }
    }
}