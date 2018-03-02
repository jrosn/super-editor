import React, {Component} from 'react';
import './App.css';
import Instruments, {
    LINE_INSTRUMENT, LINE_SELECTED_ACTION, LOAD_IMAGE_ACTION, SAVE_IMAGE_ACTION,
    TO_BLACK_AND_WHITE_ACTION, UNDO_ACTION
} from "./instruments";

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            operations: [],
            scale: 1,
            offset: {x: 0, y: 0},
            mouseStartPosition: null,
            selectedPoint: null,
            selectedInstrument: null,
            scaleOffsetStack: []
        }
    }

    onInstrumentEvent(event) {
        let [type, param] = [event.type, event.param];

        if (type === LOAD_IMAGE_ACTION) {
            this.setState((prevState, props) => ({
                operations: prevState.operations.concat([{
                    type: "loadImage",
                    args: param
                }])
            }), () => this.draw())
        } else if (type === TO_BLACK_AND_WHITE_ACTION) {
            this.setState((prevState, props) => ({
                operations: prevState.operations.concat([{
                    type: "toBlackAndWhite"
                }])
            }), () => this.draw())
        } else if (type === LINE_SELECTED_ACTION) {
            this.setState({
                selectedInstrument: param
            }, () => this.draw());
        } else if (type === UNDO_ACTION) {
            this.setState({
                operations: this.state.operations.slice(0, -1)
            }, () => this.draw())
        } else if (type === SAVE_IMAGE_ACTION) {
            /*let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');

            let lastImage = null;
            for (let op of this.state.operations) {
                if (op.type === "loadImage") {
                    lastImage = op.args;
                }
            }

            if (lastImage === null)
                return;

            canvas.height = lastImage.height;
            canvas.width = lastImage.width;

            this.applyOperations(canvas, context);*/

            let e = document.createElement("a");
            e.href = this.refs.canvas.toDataURL("image/png");
            e.download = "image.png";
            e.click();
        }
    }

    draw() {
        let scale = this.state.scale;
        let offset = this.state.offset;
        console.log("Redrawing", scale, offset);

        const canvas = this.refs.canvas;
        const context = canvas.getContext("2d");

        context.imageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;

        context.clearRect(0, 0, canvas.width, canvas.height);
        // Применяем масштаб
        context.save();
        context.translate(offset.x, offset.y);

        context.scale(scale, scale);

        this.applyOperations(canvas, context);

        context.restore();

        if (scale > 15) {
            for (let i = 0; i * scale < canvas.width; i++) {
                for (let j = 0; j * scale < canvas.height; j++) {
                    context.strokeRect(i * scale + offset.x % scale, j * scale + offset.y % scale, scale, scale);
                }
            }
        }
    }

    applyOperations(canvas, context) {
        let operations = this.state.operations;
        for (let op of operations) {
            if (op.type === "loadImage") {
                context.drawImage(op.args, 0, 0);
            } else if (op.type === "drawLine") {
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = 'red';
                context.moveTo(op.args.p1.x + 0.5, op.args.p1.y);
                context.lineTo(op.args.p2.x + 0.5, op.args.p2.y);
                context.stroke();
            } else if (op.type === "toBlackAndWhite") {
                let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                imageData = App.toBlackAndWhiteImageData(imageData);
                context.putImageData(imageData, 0, 0);
            }
        }
    }

    onWheel(event) {
        let deltaY = event.deltaY;

        this.setState((prevState, pclientYrops) => {
            let scale = prevState.scale + deltaY * 0.05 / (prevState.scale === 0 ? 1 : prevState.scale);
            if (scale < 0) {
                scale = 0;
            }
            return {
                scale: scale
            }
        });

        this.draw();
    }

    onMouseDown(event) {
        let x = event.clientX;
        let y = event.clientY;

        if (event.buttons === 2) {
            this.setState({
                mouseStartPosition: {x: x, y: y}
            });
        } else if (event.button === 0) {
            const b = this.refs.canvas.getBoundingClientRect();
            const scale = this.state.scale;
            let x = ((event.pageX - b.left) - this.state.offset.x) / scale;
            let y = ((event.pageY - b.top)  - this.state.offset.y) / scale;

            if (this.state.selectedInstrument !== null && this.state.selectedPoint === null) {
                this.setState({
                    selectedPoint: {x: x, y: y}
                });
                return;
            }

            if (this.state.selectedInstrument === LINE_INSTRUMENT && this.state.selectedPoint !== null) {
                this.setState((prevState, props) => ({
                    operations: prevState.operations.concat([{
                        type: "drawLine",
                        args: {p1: this.state.selectedPoint, p2: {x: x, y: y}}
                    }]),
                    selectedPoint: null,
                    selectedInstrument: null
                }));
            }
        }


        this.draw()
    }

    onMouseUp(event) {
        this.setState({
            mouseStartPosition: null
        });
        this.draw()
    }

    onMouseMove(event) {
        let x = event.clientX;
        let y = event.clientY;

        if (this.state.mouseStartPosition !== null) {
            this.setState({
                offset: {
                    x: this.state.offset.x + (x - this.state.mouseStartPosition.x),
                    y: this.state.offset.y + (y - this.state.mouseStartPosition.y)
                },
                mouseStartPosition: {x: x, y: y}
            });
        }

        this.draw();
    }

    render() {
        return (
            <div className="App">
                <Instruments onInstrumentEvent={this.onInstrumentEvent.bind(this)}/>
                <canvas
                    ref="canvas"
                    width={window.innerWidth - 50}
                    height={window.innerHeight - 50}

                    onWheel={this.onWheel.bind(this)}
                    onMouseMove={this.onMouseMove.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onMouseDown={this.onMouseDown.bind(this)}

                />
            </div>
        );
    }

    static toBlackAndWhiteImageData = (imageData) => {
        for (let i = 0; i < imageData.height; i++) {
            for (let j = 0; j < imageData.width; j++) {
                let idx = (4 * i) * imageData.width + (4 * j);

                let red = imageData.data[idx];
                let green = imageData.data[idx + 1];
                let blue = imageData.data[idx + 2];
                let alpha = imageData.data[idx + 3];
                let average = (red + green + blue) / 3;

                imageData.data[idx] = average;
                imageData.data[idx + 1] = average;
                imageData.data[idx + 2] = average;
                imageData.data[idx + 3] = alpha;
            }
        }

        return imageData;
    };
}

export default App;
