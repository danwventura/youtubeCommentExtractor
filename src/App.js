import logo from './logo.svg';
import './App.css';
import styles from './styles.css';
import getAllComments from './download';

function App() {

  return (
    <div className="App">
      <div id="mainContainer" className='card'>
        <div className='card-body'>
          <div className='row'>
            <div className="col-1">&nbsp;</div>
            <div id="youtubeImg" className="col-3">
              <image src={require('../src/img/youtube_button.png')}/>
            </div>
            <div className="col-3">
              <h5 className='card-title'>YouTube Comment Extractor</h5>
            </div>
          </div>
          <div className="row" id="elementRow">
            <div className="col-2">&nbsp;</div>
            <div className="col-6">
              <input type="text" id="ytUrl" value="https://www.youtube.com/watch?v=ynUgP5eMhpA"></input>
            </div>
            <div className="col-2">
              <button id="download" type="button" onClick={getAllComments} className="btn btn-primary text-start">Download</button>
            </div>
            <div className="col-4">&nbsp;</div>
          </div>
          <div className='row'>
            <div className="col-4">&nbsp;</div>
            <div className="col-3">
              <a id="anchor" style={{display:'none'}}>Click to Download</a>
            </div>
          </div>    
        </div>
      </div>
    </div>
  );
}

export default App;
