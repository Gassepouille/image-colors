#Image colors

Javascript module to get a list of the most used colors in an image

usage : 

```javascript
let imageColors = new ImageColors({
        removeMainBlack:false,
        removeMainWhite:false,
        maxColors : 5,
        trimSimilarColors: true,
        thresholdSimilarColors : 35,
});
let url = "./sample.jpg";
let colors = await imageColors.getColors(url);
```

npm install @gassepouille/image-colors