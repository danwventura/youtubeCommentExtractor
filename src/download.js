import $ from 'jquery'; 

// function getAllComments() {
//     console.log('loaded');
// }

let commentsArray = [];
let cleanedCommentsArray = [];
let vidId = "";
let nextPageToken = "";
let nextReplyPageToken ="";
let regexRule1 = /,/g;
let regexRule2 = /\n/g;
let regexRule3 = /\"/g;
let commentCount = 0;
let topLevelCommentsDone = false;
let manyReplies = 0;
let resolvedRepliesPromises = 0;
let replyCount = 0;
let topLevelCommentCount = 0;

function getAllComments() {
    let videoId = getVideoIdFromURL();
    debugger;
    let totalCommentsLength = getTotalCommentCount(videoId);
}

function getVideoIdFromURL(){
    let videoURL = $("#ytUrl").val();
    let stringLength = videoURL.length;
    let equalIndex = videoURL.indexOf("=") + 1;
    let videoId = videoURL.slice(equalIndex, stringLength);
    return videoId;
  }
  
  function setNextPageToken(returnedToken){
    nextPageToken = returnedToken;
  }
  
  
  const getTotalCommentCount= async (videoId) => {
    // let key = "AIzaSyCnoKEUlC9FFnmySrbMYIQDDu5W8AdR9Ro";
    //VVV BACKUP KEY
    let key = 'AIzaSyAEAIJ4K1jJt-Ogn_AaMOsN1YK7DHwMUCc';
  
  
    let requestURL = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${key}`
    $.ajax({
      url: requestURL,
      type: "GET",
      dataType: "json",
      key: "AIzaSyCnoKEUlC9FFnmySrbMYIQDDu5W8AdR9Ro",
      videoId: videoId,
      processData: false,
      contentType: false,
      cache: false,
      success: function (data) {
        const firstCommentSetPromise = new Promise((resolve, reject) =>{
          let successfulRequest = true;
          //getting total comment count for video
          let commentCount = parseInt(data.items[0].statistics.commentCount);
        //   console.log("first promise & total comments: ", commentCount);
          //building videoData object to pass commentCount, number of comments in hundreds, remainder, and videoId
          let videoData = buildVideoDataObject(commentCount, videoId);
          let remainder = videoData.remainder;
          // console.log("--> REMAINDER <---", remainder);
          commentCount = videoData.commentCount;
          vidId = videoData.videoId;
          let cData = getFirstComments(videoData);
          resolve(cData);
        //   console.log("firstCOMMENTS :", cData);
      }).then((cData) => {
          nextPageToken = cData.nextPageToken;
          formatCommentsAndPushToArray(cData);
        })
        .then(() => {
          addRemainingComments();
        })
      },
      error: function (xhr) {
        console.log("Error!" + xhr.status);
      },
    //   complete: function(){
    //     if(successfulRequest != true){
    //       alert('An error has occurred in API request!');
    //     }
    //   },
    });
  }
  
  async function addRemainingComments(){
    // const key = "AIzaSyCnoKEUlC9FFnmySrbMYIQDDu5W8AdR9Ro";
    //VVV BACKUP KEY
    const key = 'AIzaSyAEAIJ4K1jJt-Ogn_AaMOsN1YK7DHwMUCc';
    while(nextPageToken != undefined){
      let data = await $.get(`https://www.googleapis.com/youtube/v3/commentThreads?key=${key}&textFormat=plainText&part=snippet,replies&videoId=${vidId}&maxResults=100&pageToken=${nextPageToken}`);
      // debugger;
      console.log("remaining comments PROMISE");
      formatCommentsAndPushToArray(data);
      nextPageToken = data.nextPageToken;
    }
    if(nextPageToken === undefined){
      // console.log('print!');
      // printAllRemainingComments(commentsArray);
      topLevelCommentsDone = true;
    }
  }
  
  function formatCommentsAndPushToArray(data){
    // debugger;
    let rawComments = data.items;
    rawComments.forEach(commentObject => {
      let id = commentObject.snippet.topLevelComment.id;
      let commentCount = commentObject.snippet.totalReplyCount;
      let message = commentObject.snippet.topLevelComment.snippet.textOriginal;
      let dateTime = new Date(commentObject.snippet.topLevelComment.snippet.publishedAt);
      let month = dateTime.getMonth() + 1;
      let date = dateTime.getDate();
      let year = dateTime.getFullYear();
      let hours = dateTime.getHours() + 1;
      let minutes = dateTime.getMinutes() + 1;
      if(hours < 10){
        hours = "0" + hours.toString();
      }
      else {
        hours = hours.toString();
      }
      if(minutes < 10){
        minutes = "0" + minutes.toString();
      } else {
        minutes = minutes.toString();
      }
      let dateString = month + "/" + date + "/" + year;
      let timeString = hours + ":" + minutes;
      if(message.match(regexRule1)){
        message = message.replace(/,/g, "");
        let something = 1;
      }
      if(message.match(regexRule2)){
        message = message.replace(/(\r\n|\n|\r)/g, "");
        let something2 = 2;
      }
      //NOT WORKING VVVVVV
      // if(message.match(regexRule3)){
      //   // debugger;
      //   message = message.replace(/\"/g, "");
      //   let something3 = 3;
      // }
      message = dateString + "," + timeString + "," + message;
      if(commentCount > 5){
        manyReplies++;
        let messageObject = {id: id, message: message};
        getAllCommentReplies(messageObject)
      } else if(commentCount > 0){
        // debugger;
        commentsArray.push(message);
        topLevelCommentCount++;
        addCommentRepliesToArray(commentObject.replies.comments);
      } else {
        topLevelCommentCount++;
        commentsArray.push(message);
      }
    })
  }
  
  async function getAllCommentReplies(messageObject){
  
    let parentId = messageObject.id;
    let message = messageObject.message;
    let replies = [];
    // let key = "AIzaSyCnoKEUlC9FFnmySrbMYIQDDu5W8AdR9Ro";
    //VVV BACKUP KEY
    let key = 'AIzaSyAEAIJ4K1jJt-Ogn_AaMOsN1YK7DHwMUCc';
    // let nextReplyPageToken = "";
  
    while(1){
      let data = "";
      if(nextReplyPageToken == "" || nextReplyPageToken == undefined){
        console.log("primary");
        data = await $.get(`https://www.googleapis.com/youtube/v3/comments?key=${key}&textFormat=plainText&part=snippet&videoId=${vidId}&maxResults=100&parentId=${parentId}`);
        console.log('data1', data);
        nextReplyPageToken = data.nextPageToken;
      } else {
        console.log("secondary", nextReplyPageToken);
        data = await $.get(`https://www.googleapis.com/youtube/v3/comments?key=${key}&textFormat=plainText&part=snippet&videoId=${vidId}&maxResults=100&pageToken=${nextReplyPageToken}&parentId=${parentId}`);
        console.log('data2', data);
  
        nextReplyPageToken = data.nextPageToken;
      }
      // debugger;
      console.log('data PRE', data);
      // console.log("More than 5 replies PROMISE");
      resolvedRepliesPromises++
      // console.log("REPLIES NPT", data.nextPageToken);
      console.log("typeof", typeof(nextReplyPageToken));
      // console.log("replyData", data);
      for(let j =0; j < data.items.length; j++){
        replies.push(data.items[j]);
      }
      if(typeof nextReplyPageToken === "undefined"){
        // console.log("repliesLENGTH", replies.length);
        addCommentRepliesToArray(replies, message);
        break;
      }
    }
  }
  
  function addCommentRepliesToArray(replies, message){
    //ternary operators?
    let replyLength = replies.length;
    if(message){
      topLevelCommentCount++;
      commentsArray.push(message);
    }
    for (let i = 0; i < replyLength; i++) {
  
        let incrementedI = i + 1;
        let reply = replies[i].snippet.textOriginal;
        let dateTime = new Date(replies[i].snippet.publishedAt);
        let month = dateTime.getMonth() + 1;
        let date = dateTime.getDate();
        let year = dateTime.getFullYear();
        let hours = dateTime.getHours() + 1;
        let minutes = dateTime.getMinutes() + 1;
        if(hours < 10){
          hours = "0" + hours.toString();
        }
        else {
          hours = hours.toString();
        }
        if(minutes < 10){
          minutes = "0" + minutes.toString();
        } else {
          minutes = minutes.toString();
        }
        let dateString = month + "/" + date + "/" + year;
        let timeString = hours + ":" + minutes;
        if(reply.match(regexRule1)){
            reply = reply.replace(/,/g, "");
        }
        if(reply.match(regexRule2)){
            reply = reply.replace(/(\r\n|\n|\r)/g, "");
        }
        const replyString = dateString + "," + timeString + "," + "Reply " + incrementedI + ": " + reply;
        replyCount++;
        commentsArray.push(replyString);
    }
    // console.log("started", manyReplies);
    // console.log("finished", resolvedRepliesPromises);
    if(topLevelCommentsDone && manyReplies == resolvedRepliesPromises){
    //   console.log("print called!");
    //   console.log("TOTAL COMMENTS: ", topLevelCommentCount);
    //   console.log("TOTAL REPLIES: ", replyCount);
      printAllRemainingComments(commentsArray);
    }
  
  }
  
  function buildVideoDataObject(comment_count, video_id){
    let numberOfHundreds = Math.floor(comment_count / 100);
    let remainder = comment_count % 100;
  
    let videoData = {
      commentCount: comment_count,
      videoId: video_id,
      hundredsCount: numberOfHundreds,
      remainder: remainder
    }
    return videoData;
  }
  
  const getFirstComments = async (videoData) => {
    // const key = "AIzaSyCnoKEUlC9FFnmySrbMYIQDDu5W8AdR9Ro";
    //VVV BACKUP KEY
    const key = 'AIzaSyAEAIJ4K1jJt-Ogn_AaMOsN1YK7DHwMUCc';
    const video_id = videoData.videoId;
    try {
        let firstPageUrl = `https://www.googleapis.com/youtube/v3/commentThreads?key=${key}&textFormat=plainText&part=snippet,replies&videoId=${video_id}&maxResults=100&pageToken=${nextPageToken}`;
        const res = await fetch(firstPageUrl);
        const data = await res.json();
        return data;
    }catch(err){
        console.log("Error : ", err);
    }
  
  }
  
  function printAllRemainingComments(commentsArray){
    console.log('commentsArrayHere', commentsArray);
    let csvString = "";
    let messageCount = 0;
    commentsArray.forEach(message => {
        csvString += `"${message}",\r\n'`;
    });
    let myBlob = new Blob([csvString], {type: "text/csv"});
    let url = window.URL.createObjectURL(myBlob);
    $("#anchor").attr("href", url);
    $('#theSpinner').css("display", "none");
    $("#anchor").css({"display": "inline"});
    
    // commentsArray = [];
  }
  

export default getAllComments;