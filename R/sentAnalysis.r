#' Returns the valence of the input Text
#' @param inputText
#' @return valence value between -1 and 1
#'
#' @export


sentAnalysis <- function(inputText=""){
  valence<-sentimentr::sentiment(inputText)
  valence<-valence[1,"sentiment"]
  valence<-as.numeric(valence)
  valence<-valence[[1]]
  valence<-(valence+1)/2.0
  #return(c(1,valence))
  #flag=0
  if(TRUE){
    emotionList<-sentimentr::emotion(inputText,drop.unused.emotions=TRUE)
    #emotionList<-dplyr::select(emotionList,4:5)
    #emotionName<-as.list(emotionList[,"emotion_type"])
    #emotionCount<-as.list(emotionList[,"emotion_count"])
    #emotionName<-emotionList[,"emotion_type"]
    emotionName<-emotionList[,"emotion_type"]

    #emotionList<-as.character(emotionName[[1]])
    emotionList<-as.character(emotionName)
    l<-length(emotionList)
    if(l==0){
      return(c(-1,valence))
    }
    for(i in 1:l){



      if(emotionList[i]=="anger"){

        flag=1
        for(i in 1:l){


          if(emotionList[i]=="disgust"){
            return(c(0.7,valence))
          }
        }
        return(c(0.5,valence))
      }
      else if(emotionList[i]=="joy"){

        flag=1
        return(c(1,valence))
      }


    }


    for(i in 1:l){


      if(emotionList[i]=="fear"){

        for(i in 1:l){


          if(emotionList[i]=="sadness"){
            return(c(0.0,valence))
          }
        }
        return(c(0.3,valence))
      }
    }

  }

}
