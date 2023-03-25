import logo from './logo.svg';
import './App.css';
import styles from './styles.css';
import doSomething from './download';

function App() {

  return (
    <div className="App">
      <div id="mainContainer" className='card'>
        <div className='card-body'>
          <div className='row'>
            <div class="col-1">&nbsp;</div>
            <div id="youtubeImg" class="col-3">
              <image src={require('../src/img/youtube_button.png')}/>
            </div>
            <div class="col-3">
              <h5 className='card-title'>YouTube Comment Extractor</h5>
            </div>
          </div>
          <div class="row" id="elementRow">
            <div class="col-2">&nbsp;</div>
            <div class="col-6">
              <input type="text" id="ytUrl"></input>
            </div>
            <div class="col-2">
              <button id="download" type="button" onClick={doSomething} className="btn btn-primary text-start">Download</button>
            </div>
            <div class="col-4">&nbsp;</div>
          </div>       
        </div>
      </div>
    </div>
  );
}

export default App;
