#' @parameter inputText
#' @return initial energy value of range
#' @export

getEmotion <- function(inputText=""){

  flag=0

  emotionList<-sentimentr::emotion(inputText,drop.unused.emotions=TRUE)
  emotionList<-dplyr::select(emotionList,4:5)
  emotionName<-as.list(emotionList[,emotion_type])
  emotionCount<-as.list(emotionList[,emotion_count])

  l<-length(emotionName)
  if(l==0){
    return(-1);
  }
  for(i in 1:l){

    name=as.character(emotionName[[i]])

    if(name=="anger"){

      flag=1
      for(i in 1:l){
        name=as.character(emotionName[[i]])

        if(name=="disgust"){
          return(0.7)
        }
      }
      return(0.5)
    }
    if(name=="joy"){

      flag=1
      return(1)
    }


  }


  for(i in 1:l){

    name=as.character(emotionName[[i]])
    if(name=="fear"){

      for(i in 1:l){

        name=as.character(emotionName[[i]])
        if(name=="sadness"){
          return(0.0)
        }
      }
      return(0.3)
    }
  }

}




