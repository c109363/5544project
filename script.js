let csvData = null;

function init() {
    loadImages();
    loadCSVData();
}

function loadCSVData() {
    d3.csv('what.csv').then(data => {
        csvData = data;
        // 在这里调用绘图函数也是一个选择，如果需要立即绘图
    });
}


function loadImages() {
    const imageFilenames = [
'Bar.InfoVisC.105.3.jpg', 'Bar.InfoVisC.131.14.jpg', 'Bar.InfoVisC.141.1.jpg', 
'Bar.InfoVisC.145.1.jpg', 'Bar.InfoVisC.173.12.jpg', 'Bar.InfoVisC.203.1.jpg', 
'Bar.InfoVisC.203.6.jpg', 'Bar.InfoVisC.203.7.jpg', 'Bar.InfoVisC.57.1.jpg', 
'Bar.InfoVisC.95.6.jpg', 'Bar.InfoVisJ.1073.7.jpg', 'Bar.InfoVisJ.1182.8.jpg', 
'Bar.InfoVisJ.1214.9.jpg', 'Bar.InfoVisJ.1492.4.jpg', 'Bar.InfoVisJ.330.11.jpg',
 'Bar.InfoVisJ.399.12.jpg', 'Bar.InfoVisJ.401.9.jpg', 'Bar.InfoVisJ.419.7.jpg', 
 'Bar.InfoVisJ.479.11.jpg', 'Bar.InfoVisJ.485.5.jpg', 'Bar.InfoVisJ.509.3.jpg', 
 'Bar.InfoVisJ.539.9.jpg', 'Bar.InfoVisJ.860.7.jpg', 'Bar.InfoVisJ.890.8.jpg', 
 'Bar.InfoVisJ.918.1.jpg', 'Bar.InfoVisJ.924.6.jpg', 'Bar.InfoVisJ.935.7.jpg', 
 'Bar.SciVisJ.886.6.jpg', 'Bar.SciVisJ.886.8.jpg', 'Bar.VASTC.155.1.jpg', 
 'Bar.VASTJ.1374.12.jpg', 'Bar.VASTJ.1396.3.jpg', 'Bar.VASTJ.1427.3.jpg', 
 'Bar.VASTJ.1427.7.jpg', 'Bar.VASTJ.1448.7.jpg', 'Bar.VASTJ.1753.10.jpg', 
 'Bar.VASTJ.210.13.jpg', 'Bar.VASTJ.270.12.jpg', 'Bar.VASTJ.290.4.jpg',
  'Bar.VASTJ.432.8.jpg', 'Bar.VASTJ.656.8.jpg', 'Bar.VASTJ.817.4.jpg',
   'Bar.VisC.151.10.jpg', 'Bar.VisC.151.11.jpg', 'Bar.VisC.167.10.jpg', 
   'Bar.VisC.167.9.jpg', 'Bar.VisC.400.2.jpg', 'Bar.VisC.400.4.jpg', 'Bar.VisC.447.9.jpg', 
   'Bar.VisC.503.6.jpg'
];
    const imageContainer = document.getElementById('image-container');
    imageFilenames.forEach(filename => {
        const img = document.createElement('img');
        img.src = `VIS30KBars/${filename}`;
        img.alt = 'Thumbnail';
        img.classList.add('thumbnail');
        img.addEventListener('click', () => selectImage(filename));
        imageContainer.appendChild(img);
    });
}

let selectedImages = [null, null];

function selectImage(filename) {
    const thumbnails = document.querySelectorAll('#image-container .thumbnail');

    if (selectedImages[0] !== filename) {
        selectedImages[1] = selectedImages[0]; 
        selectedImages[0] = filename; 
    } else {
        selectedImages[0] = selectedImages[1];
        selectedImages[1] = filename;
    }

    thumbnails.forEach(thumbnail => {
        if (thumbnail.src.includes(filename)) {
            thumbnail.classList.add('selected');
        } else {
            thumbnail.classList.remove('selected');
        }
    });
    updateSelectedImagesDisplay();
    updateThumbnailsSelection();
}

function updateSelectedImagesDisplay() {
    const imageArea1 = document.getElementById('image-area-1');
    if (selectedImages[0]) {
        imageArea1.style.backgroundImage = `url(VIS30KBars/${selectedImages[0]})`;
    } else {
        imageArea1.style.backgroundImage = '';
    }

    const imageArea2 = document.getElementById('image-area-2');
    if (selectedImages[1]) {
        imageArea2.style.backgroundImage = `url(VIS30KBars/${selectedImages[1]})`;
    } else {
        imageArea2.style.backgroundImage = '';
    }

    let selectedData = selectedImages.map(imageName => 
        csvData.find(row => row.ImageName === imageName)
      ).filter(d => d); // 过滤掉未找到的项

      const attributes = [
        'VCScore', 'S.ColorDiversity', 'S.ShapeDiversity', 
        'S.ObjectDiversity', 'S.Patterns', 'S.FeatureCongestion', 
        'S.InformationCapacity', 'S.Understandability'
      ];

      const attributes2 = [
        'O.Colorfulness','O.SubbandEntropy','O.FeatureCongestion','O.EdgeDensity',
        'O.Heterogeneity','O.FeatureCount','O.ColorEntropy','O.ImageEntropy'
      ];

      // 调用绘图函数
      drawBarChart(selectedData, '#chart1', attributes, [ '#0B967D' , '#88C3B1']);
      drawBarChart(selectedData, '#chart2', attributes2, [ '#0B967D' , '#88C3B1']);


}

function updateThumbnailsSelection() {
    const thumbnails = document.querySelectorAll('#image-container .thumbnail');
    thumbnails.forEach(thumbnail => {
        if (thumbnail.src.includes(selectedImages[0]) || thumbnail.src.includes(selectedImages[1])) {
            thumbnail.classList.add('selected');
        } else {
            thumbnail.classList.remove('selected');
        }
    });
}


function drawBarChart(selectedData, selector, attributes, colorMap) {
    // 清空图表容器
    d3.select(selector).select("svg").remove();

    const container = d3.select(selector).node().getBoundingClientRect();
    const margin = { top: 30, right: 20, bottom: 70, left: 40 },
      width = container.width - margin.left - margin.right,
      height = container.height - margin.top - margin.bottom;

      if (!container.width || !container.height) {
        console.error('Container #chart1 must have a defined width and height');
        return; // 如果容器尺寸未定义，则停止执行
    }


    // 创建SVG元素
    const svg = d3.select(selector)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 创建X轴的比例尺
    const x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.1)
      .domain(attributes);

    // 创建X轴的子比例尺
    const x1 = d3.scaleBand()
      .padding(0.05)
      .domain(selectedData.map(d => d.ImageName))
      .rangeRound([0, x0.bandwidth()]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(selectedData, d => d3.max(attributes, key => Number(d[key])))])
      .nice()
      .range([height, 0]);

    // 绘制X轴
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
        .style("text-anchor", "middle");

    // 绘制Y轴
    svg.append("g")
      .call(d3.axisLeft(y));

    // 绘制条形图
    const barGroups = svg.selectAll(".bar-group")
    .data(attributes)
    .enter().append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${x0(d)},0)`);

barGroups.selectAll("rect")
    .data(d => selectedData.map(imgData => ({ 
        key: imgData.ImageName, 
        value: imgData[d], 
        imageName: imgData.ImageName  // 添加这个属性
    })))
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => d.imageName === selectedImages[0] ? '#0B967D' : '#88C3B1');  // 使用新添加的属性

    // 添加图例
    const legend = svg.selectAll(".legend")
      .data(selectedData)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      //.attr("fill", d => colorMap[d.ImageName]);
      .attr("fill", d => d.ImageName === selectedImages[0] ?  '#0B967D' : '#88C3B1');
    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d.ImageName === selectedImages[0] ? 'Image 1' : 'Image 2');
}








window.onload = init;

