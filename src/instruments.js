import React from 'react';
import './App.css';


export const LOAD_IMAGE_ACTION = "final_instrument_load-image";
export const SAVE_IMAGE_ACTION = "instrument_save-image";
export const TO_BLACK_AND_WHITE_ACTION = "final_instrument_to-b-a-w";
export const LINE_SELECTED_ACTION = "instrument_line-selected";
export const UNDO_ACTION = "instrument_undo";
export const LINE_INSTRUMENT = "instrument_line";

class Instruments extends React.Component {
    render() {
        return (
            <div className="Instruments">
                <ImageLoaderInstrument onInstrumentEvent={this.props.onInstrumentEvent} />
                <ImageSaverInstrument onInstrumentEvent={this.props.onInstrumentEvent} />
                <ToBlackAndWhiteImageInstrument onInstrumentEvent={this.props.onInstrumentEvent} />
                <LineSelectInstrument onInstrumentEvent={this.props.onInstrumentEvent} />
                <UndoInstrument onInstrumentEvent={this.props.onInstrumentEvent} />
            </div>
        );
    }
}

class ImageLoaderInstrument extends React.Component {
    onClick(e) {
        let image = new Image();
        image.src = URL.createObjectURL(e.target.files[0]);
        image.onload = () => {
            this.props.onInstrumentEvent({
                type: LOAD_IMAGE_ACTION,
                param: image
            });
        }
    }

    render() {
        return (
            <input type="file" className="ImageLoaderInstrument" onChange={this.onClick.bind(this)}/>
        );
    }
}

class ImageSaverInstrument extends React.Component {
    onClick() {
        this.props.onInstrumentEvent({
            type: SAVE_IMAGE_ACTION
        });
    }

    render() {
        return (
            <input type="button" value="save" className="ImageLoaderInstrument" onClick={this.onClick.bind(this)}/>
        );
    }
}

class ToBlackAndWhiteImageInstrument extends React.Component {
    onClick() {
        this.props.onInstrumentEvent({
            type: TO_BLACK_AND_WHITE_ACTION
        });
    }

    render() {
        return (
            <input type="button" value="to black and white" className="ToBlackAndWhiteInstrument" onClick={this.onClick.bind(this)}/>
        );
    }
}

class LineSelectInstrument extends React.Component {
    onClick() {
        this.props.onInstrumentEvent({
            type: LINE_SELECTED_ACTION,
            param: LINE_INSTRUMENT
        })
    }

    render() {
        return (
            <input type="button" value="Line" className="LineSelectInstrument" onClick={this.onClick.bind(this)}/>
        );
    }
}

class UndoInstrument extends React.Component {
    onClick() {
        this.props.onInstrumentEvent({
            type: UNDO_ACTION
        })
    }

    render() {
        return (
            <input type="button" value="Undo" className="UndoInstrument" onClick={this.onClick.bind(this)}/>
        );
    }
}

export default Instruments;