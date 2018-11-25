class ImageColors {
        constructor(options = {}) {
                this._imageUrl = null;
                this._image = new Image();
                this._canvas = document.createElement("canvas");
                this.options = Object.assign(options,{
                        removeMainBlack:false,
                        removeMainWhite:false,
                        maxColors : 5,
                        trimSimilarColors: true,
                        thresholdSimilarColors : 35,
                })
        }
        getColors(url){
                return new Promise((resolve) => {
                        this._image.onload = ()=>{
                                let ratio = this._image.height / this._image.width;

                                this._canvas.width = 250;
                                this._canvas.height = 250 * ratio;
                                let context = this._canvas.getContext('2d');
                                context.drawImage(this._image, 0, 0, 250, 250 * ratio);
                                let colors = this._getArrayColors();
                                resolve(colors);
                        }
                        this._imageUrl = url;
                        this._image.src = url;
                })
        }
        _getArrayColors(){
                let context = this._canvas.getContext('2d');
                let imageData = context.getImageData(0, 0, this._canvas.width, this._canvas.height);
                let pixelData = imageData.data;
                let colorData = {};
                let i = 0; 
                const iMax = pixelData.length;

                let r,g,b,property;

                for(; i < iMax; i+=4){ 
                        r =  pixelData[i]; // red
                        g =  pixelData[i + 1]; // green
                        b =  pixelData[i + 2]; // blue
                        // i+3 is alpha (the fourth element)
                        property = r + "_" + g + "_" + b + "_"
                        if (colorData[property]){
                                colorData[property].count++;
                        }else{
                                colorData[property] = {
                                        count : 0,
                                        color : {r:r,g:g,b:b}
                                } 
                        }
                }
                let arrayColors = [];
                for (const key in colorData) {
                        arrayColors.push(colorData[key]);
                }
                arrayColors.sort((a,b)=>{
                        return b.count - a.count;
                })
                
                arrayColors = this._trimColors(arrayColors);
                if (this.options.trimSimilarColors === true) arrayColors = this._checkSimilarColors(arrayColors);
                
                if (arrayColors.length < this.options.maxColors) arrayColors.push({r:0,g:0,b:0});
                
                return arrayColors.splice(0, this.options.maxColors - 1);
        }
        _trimColors(arrayColors){
                let isNotBlack = false;
                let isNotWhite = false;
                if (this.options.removeMainBlack) {
                        if (arrayColors[0].color.r <= 15 &&
                                arrayColors[0].color.g <= 15 &&
                                arrayColors[0].color.b <= 15) {
                                arrayColors.shift();
                        }else{
                                isNotBlack = true;
                        }
                }else{
                        isNotBlack = true;
                }
                if (this.options.removeMainWhite) {
                        if (arrayColors[0].color.r >= 240 &&
                                arrayColors[0].color.g >= 240 &&
                                arrayColors[0].color.b >= 240) {
                                arrayColors.shift();
                        }else{
                                isNotWhite = true;
                        }
                }else{
                        isNotWhite = true;
                }
                if (isNotBlack === true && isNotWhite === true){
                        return arrayColors;
                }else{
                       return this._trimColors(arrayColors);
                }
        }
        _checkSimilarColors(arrayColors){
                if (arrayColors.length < this.options.maxColors) return arrayColors;
                let hasSimilarColors = false;
                let indexToRemove = null;
                let threshold = this.options.thresholdSimilarColors;
                for (let i = 0; i < this.options.maxColors - 1; i++) {
                        let red = arrayColors[i].color.r;
                        let green = arrayColors[i].color.g;
                        let blue = arrayColors[i].color.b;
                        for (let j = 0; j < this.options.maxColors - 1; j++) {
                                if(i === j) continue;
                                if (arrayColors[j].color.r < red - threshold || arrayColors[j].color.r > red + threshold) continue;
                                if (arrayColors[j].color.g < green - threshold || arrayColors[j].color.g > green + threshold) continue;
                                if (arrayColors[j].color.b < blue - threshold || arrayColors[j].color.b > blue + threshold) continue;
                                hasSimilarColors = true;
                                indexToRemove = j;
                                break;
                        }
                        if (hasSimilarColors) break;
                }
                if(hasSimilarColors){
                        arrayColors.splice(indexToRemove, 1);
                        return this._checkSimilarColors(arrayColors);

                }else{
                        return arrayColors;
                }
        }
}