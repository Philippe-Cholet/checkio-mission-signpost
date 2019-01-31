//Dont change it
requirejs(['ext_editor_io', 'jquery_190', 'raphael_210'],
    function (extIO, $) {
        function signpostCanvas(dom, input, answer, ext) {
            if (! ext) {
                return
            }

            $(dom.parentNode).find(".answer").remove()

            const result = ext.result

            const attr = {
                signpost: {
                    "stroke-width": 0.0,
                    'fill': '#39B4ED',
                },
                number: {
                    'stroke': '#2080B8',
                    "stroke-width": 0.0,
                    'fill': '#2080B8',
                    'text-anchor': 'start',
                },
                rect: {
                    empty: {
                        'stroke': '#2080B8',
                        'stroke-width': 0.5,
                    },
                },
                line: {
                    'stroke': 'orange',
                    'stroke-linejoin': 'round',
                    'stroke-linecap': 'round',
                    'arrow-end': 'block-wide-long',
                },
                arrow: {
                    'stroke': 'orange',
                    'stroke': '#2080B8',
                    'stroke': '#8FC7ED',
                    'fill': '#8FC7ED',
                }
            }
            const signpost ="m 0 4 v -10.12 h -4.736 c -4.59,0 -4.742,0 -4.953,-0.22 c -0.206,-0.21 -0.218,-0.36 -0.218,-2.939 c 0,-2.576 0.01,-2.733 0.218,-2.939 c 0.211,-0.211 0.363,-0.217 4.953,-0.217 h 4.736 v -0.409 c 0,-0.224 -0.1,-0.53 -0.16,-0.68 c -0.26,-0.448 -0.21,-1.131 0.11,-1.508 c 0.41,-0.495 0.93,-0.628 1.54,-0.396 c 0.84,0.32 1.14,1.141 0.69,1.879 c -0.21,0.339 -0.22,0.551 -0.22,4.218 v 3.861 h 4.6 c 3.99,0 4.63,0 4.84,0.17 c 0.24,0.17 0.25,0.2 0.25,2.92 c 0,2.2 0,2.79 -0.16,2.96 c -0.15,0.2 -0.34,0.21 -4.84,0.24 h -4.69 v 6.64 v 6.63 h -0.98 h -0.98 z"
            
            const [grid, directions] = input
            const [height, width] = [grid.length, grid[0].length]

            // too much big
            if ((height * width) >= 300) {
                return
            }

            const max_width = 300
            const os = 10
            const SIZE = (max_width - os*2) / width
            const len = SIZE/3

            const paper = Raphael(dom, max_width, SIZE*height+os+1, 0, 0)

            const dic = {}
            if (result) {
                for (let i = 0; i < height; i += 1) {
                    for (let j = 0; j < width; j += 1) {
                        dic[answer[i][j]] = [j, i]
                    }
                }
            }

            /*---------------------------------------------*
             *
             * draw grid
             *
             *---------------------------------------------*/
            for (let i=0; i < height; i += 1) {
                for (let j=0; j < width; j += 1) {
                    paper.rect(
                        SIZE*j+os,
                        SIZE*i+os,
                        SIZE, SIZE).attr(attr.rect.empty)
                    if (! directions[i][j]) {
                        draw_signpost([i, j])
                    }

                    if (grid[i][j]) {
                        draw_number([i, j], grid[i][j], 'hint')
                    } else if (result && answer[i][j]) {
                        draw_number([i, j], answer[i][j], 'answer')
                    }
                    if (directions[i][j]) {
                        draw_arrow([i, j], directions[i][j])
                    }
                }
            }

            /*---------------------------------------------*
             *
             * draw line
             *
             *---------------------------------------------*/
            // fail
            if (! result) {
                return
            }

            let path = []
            for (let n = 1; n <= width*height; n += 1) {
                if (path.length === 0) {
                    path = path.concat(['M', dic[n][0]*SIZE+(SIZE/2)+os, 
                        dic[n][1]*SIZE+(SIZE/2)+os])
                } else {
                    path = path.concat(['L', dic[n][0]*SIZE+(SIZE/2)+os, 
                        dic[n][1]*SIZE+(SIZE/2)+os])
                }
            }
            paper.path(path.join(' ')).attr(attr.line).attr(
                {'stroke-width': SIZE/30 + 'px'})

            /*----------------------------------------------*
             *
             * draw signpost
             *
             *----------------------------------------------*/
            function draw_signpost(co, num) {
                const [i, j] = co
                const y = i * SIZE + os + SIZE/2
                const x = j * SIZE + os + SIZE/2
                paper.path('M' + x + ' ' + y + signpost).attr(
                    attr.signpost).scale(SIZE/40)

            }

            /*----------------------------------------------*
             *
             * draw number
             *
             *----------------------------------------------*/
            function draw_number(co, num, type) {
                const [i, j] = co
                const y = i * SIZE + os + SIZE/4
                const x = j * SIZE + os + SIZE/10

                const n = paper.text(x, y, num).attr(attr.number)
                if (type === 'hint') {
                    n.attr({'font-size': 120/width})
                    if (num === 1) {
                        n.attr({'fill': 'darkblue',})
                    }
                } else if (type == 'answer') {
                    n.attr({'font-size': 80/width})
                    n.attr({'fill': '#8FC7ED',})
                }
            }

            /*---------------------------------------------*
             *
             * draw arrow
             *
             *---------------------------------------------*/
            function draw_arrow(coord, d) {
                const z = SIZE/93.333333333
                let [y, x] = coord
                y = y*SIZE+(SIZE/2)+os
                x = x*SIZE+(SIZE/2)+os
                const deg = {'N': 270, 'NE': 315, 'E': 0, 'SE': 45, 
                    'S': 90, 'SW': 135, 'W': 180, 'NW': 225}
                paper.path(['M', x-20, y-5,
                            'l', 20, 0,
                            'l', 0, -10,
                            'l', 25, 15,
                            'l', -25, 15,
                            'l', 0, -10,
                            'l', -20, 0,
                            'z'].join(' ')).attr(
                                attr.arrow).rotate(
                                    deg[d], x, y).scale(z, z, x, y)
            }
        }

        var $tryit;

        var io = new extIO({
            multipleArguments: true,
            functions: {
                python: 'signpost',
                //js: 'signpost'
            },
            animation: function($expl, data){
                signpostCanvas(
                    $expl[0],
                    data.in,
                    data.out,
                    data.ext,
                );
            }
        });
        io.start();
    }
);
