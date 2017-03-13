const fakeUserData = [
    { company_id: 'MST', name: 'Microsoft', total_users: 32 },
    { company_id: 'GRA', name: 'Grapple', total_users: 7 },
    { company_id: 'MIM', name: 'Mimics', total_users: 21 },
    { company_id: 'QTZ', name: 'Quetzal', total_users: 16 },
    { company_id: 'COS', name: 'Costco', total_users: 45 },
    { company_id: 'RAR', name: 'Rarraion', total_users: 2 },
    { company_id: 'JCD', name: 'Plumbus, Inc', total_users: 14 }
];
const fakeCompanyData = [
    { alpha_2_code: 'US', country_name: 'United States', company_name: 'Microsoft' },
    { alpha_2_code: 'US', country_name: 'United States', company_name: 'Apple' },
    { alpha_2_code: 'US', country_name: 'United States', company_name: 'CostCo' },
    { alpha_2_code: 'US', country_name: 'United States', company_name: 'GitHub' },
    { alpha_2_code: 'CA', country_name: 'Canada', company_name: 'Maple Town' },
    { alpha_2_code: 'CA', country_name: 'Canada', company_name: 'Hockey R Us' },
    { alpha_2_code: 'SA', country_name: 'South Africa' },
    { alpha_2_code: 'MX', country_name: 'Mexico', company_name: 'MegaMart' },
    { alpha_2_code: 'MX', country_name: 'Mexico', company_name: 'Valentina' },
    { alpha_2_code: 'MX', country_name: 'Mexico', company_name: 'Banamex' },
    { alpha_2_code: 'SP', country_name: 'Spain', company_name: 'Spain One' },
    { alpha_2_code: 'SP', country_name: 'Spain', company_name: 'Spain Two' },
    { alpha_2_code: 'AG', country_name: 'Angola' }
];

function getTopFive(arr, criteria) {
    return arr.sort((a, b) => {
        return a[criteria] > b[criteria] ? -1 : 1;
    }).slice(0, 5);
}

function barChartInit(chartData, wrapperDimensions, hostElementName) {
    const companiesByCountry = {};
    const companiesByCountryArray = [];
    chartData.forEach(company => {
        const code = company['alpha_2_code'];
        if(companiesByCountry[code]) {
            companiesByCountry[code] += 1;
        } else {
            companiesByCountry[code] = 1;
        }

    });

    for(let code in companiesByCountry) {
        if(companiesByCountry[code]) {
            const countryName = chartData.find(country => country['alpha_2_code'] === code)['country_name'];
            companiesByCountryArray.push({
                code,
                country: countryName, 
                count: companiesByCountry[code]
            });
        }
    }
    
    const top5 = this.getTopFive(companiesByCountryArray, 'count').reverse();
    const color = d3.scale.ordinal()
        .range(['#332532', '#644D52', '#F77A52', '#FF974F', '#A49A87']);
    const mainPadding = 30;
    const barPadding = 0;
    const height = wrapperDimensions['height'] - mainPadding;
    const width = wrapperDimensions['width'] - mainPadding;
    

    const svg = d3.select(hostElementName).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    const xScale = d3.scale.ordinal()
        .domain(d3.range(1, top5.length + 1))
        .rangeRoundBands([mainPadding, width], 0.05); 

    const yScale = d3.scale.linear()
        .domain([0, d3.max(top5.map(country => country['count']))])
        .range([0, height - (mainPadding + 20)]);

    const rect = svg.selectAll('rect')
        .data(top5)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * (width / top5.length))
        .attr('width', width / top5.length)
        .attr('fill', (d, i) => color(i))
        .attr('y', d => height - yScale(d.count))
        .attr('height', d => yScale(d.count))
        .style('transform', `translate(0, ${-mainPadding}px)`)
        .style('opacity', 0);

    rect.transition()
        .delay((d, i) => i * 200)
        .ease('linear')
        .duration(300)
        .style('opacity', 1);

    const label = svg.selectAll('text')
        .data(top5)
        .enter()
        .append('text')
        .text((d) => `${d.code} - ${d.count}`)
        .attr('transform', 'rotate(270)')
        .attr('text-anchor', 'top')
        .attr('x', -height + 40)
        .attr('y', (d, i) => i * (width / top5.length + 1) + mainPadding)
        .style('font-size', '12pt')
        .attr('fill', '#fff');


    const title = svg.append('text')
        .attr('x', width / 2)             
        .attr('y', 15) //need to adjust for container's header
        .attr('text-anchor', 'middle')  
        .style('font-size', '16pt') 
        .style('text-decoration', 'underline')  
        .text('Companies per country');

    const showDetails = svg.append('text')
        .attr('x', width / 2)             
        .attr('y', height - 10) //need to adjust for container's header
        .attr('text-anchor', 'middle')  
        .style('font-size', '12pt') 
        .style('text-decoration', 'underline')
        .style('transform', 'translateY(35px)') 
        .style('transition', 'transform 0.3s');

    [rect, label].forEach(div => {
        div.on('mouseover', (d, i) => {
            showDetails.text(`${d.country} - ${d.count}`);
            showDetails.style('transform', 'translateY(0)');
        }).on('mouseout', (d, i) => {
            showDetails.style('transform', 'translateY(35px)');
            showDetails.text('');
        });
    });
}

function pieChartInit(chartData, wrapperDimensions, hostElementName) {
    const top5 = this.getTopFive(chartData, 'total_users');

    //need to get width of div containing chart on dashboard
    const height = wrapperDimensions['height'];
    const width = wrapperDimensions['width'];
    const radius = Math.min(width, height) / 3.5;

    const arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(0);
    
    //placeholder color range
    const color = d3.scale.ordinal()
        .range(['#332532', '#644D52', '#F77A52', '#FF974F', '#A49A87']);

    const pie = d3.layout.pie()
        .sort(null)
        .startAngle(3.1 * Math.PI)
        .endAngle(1.1 * Math.PI)
        .value(d => d['total_users'] * 10);

    const svg = d3.select(hostElementName).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2 - 50}, ${height / 2})`);

    const g = svg.selectAll('.arc')
        .data(pie(top5))
        .enter().append('g')
        .attr('class', 'arc');

    g.append('path')
        .style('fill', (d, i) => color(i))
        .style('stroke', '#fff')
        .style('cursor', 'pointer')
        .transition()
        .ease('linear')
        .duration(300)
        .attrTween('d', d => {
            const i = d3.interpolate(d['startAngle'], d['endAngle']);
            return t => {
                d['endAngle'] = i(t);
                return arc(d);
            };
        })
        .attr('data-key', (d, i) => d['data']['company_id']);

    const slice = g.selectAll('path');

    const title = svg.append('text')
        .attr('x', width / 2)             
        .attr('y', 15) //need to adjust for container's header
        .attr('text-anchor', 'middle')  
        .style('font-size', '16pt') 
        .style('text-decoration', 'underline')  
        .attr('transform', `translate(-${width / 2 - 50}, -${height / 2 - 20})`)
        .text('Users per company');

    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('height', 125)
        .attr('width', 125);

    const legendSquare = legend.selectAll('rect')
        .data(top5)
        .enter()
        .append('rect')
        .attr('x', radius + 10)
        .attr('y', function(d, i){ return i *  20; })
        .attr('data-key', (d, i) => d['company_id'])
        .attr('width', 10)
        .attr('height', 10)
        .style('cursor', 'pointer')
        .style('fill', (d, i) => color(i));
        
    const legendText = legend.selectAll('text')
        .data(top5)
        .enter()
        .append('text')
        .attr('x', radius + 25)
        .attr('y', (d, i) => i *  20 + 9)
        .attr('data-key', (d, i) => d['company_id'])
        .style('fill', (d, i) => color(i))
        .style('cursor', 'pointer')
        .text(d => `${d['name']} - ${d['total_users']}`);

    [legendText, legendSquare, slice].forEach(div => {
        let originalFill, divs;

        div.on('mouseover', function(d, i) {
            originalFill = d3.select(this).style('fill');
            const key = d['data'] ? d['data']['company_id'] : d['company_id'];
            
            divs = d3.selectAll(`[data-key='${key}']`)
                .style('fill', '#c1071e');
        }).on('mouseout', function(d, i, prevColor) {
            divs.style('fill', originalFill);
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const chartWrapper = document.querySelector('.half-width');
    const chartWrapperDimensions = {
        height: chartWrapper.clientHeight,
        width: chartWrapper.clientWidth
    };

    barChartInit(fakeCompanyData, chartWrapperDimensions, '#bar-chart');
    pieChartInit(fakeUserData, chartWrapperDimensions, '#pie-chart');
}, false);