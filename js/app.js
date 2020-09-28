var App = function(){


    var SearchHistory = null;
    var SearchWord = "";
    var Key = "c9a50add";

    var service = "http://www.omdbapi.com/";

    var SearchResults = [];

    var FavoriteMovies = [];

    return{

        init: function(){
            console.log("initialize completed");
            this.listHistory();
            this.listFavorites();
        },
        getStorage: function(name){
            var storageItem = localStorage.getItem(name);
            if(storageItem != ""){
                return JSON.parse(storageItem);
            }else{
                return false;
            }
        },
        setStorage: function(name , text){
            try{
                localStorage.setItem(name, JSON.stringify(text));
                return true;
            }catch(ex){
                console.log(ex);
                return false;
            }
        },
        addHistory: function(text){
            var id = this.getIDSearchHistory(text);
            var randID = Math.floor(Math.random() * 300000 +1);
            if(SearchHistory.length>9){
                alert("Search history capacity is full. Remove any history text.");
                return;
            }
            if(id >= 0){
                this.listHistory();
                return false;
            }else{
                var data = {"Text": text, "ID": randID};
                SearchHistory.push(data);
                this.setStorage("search-history", SearchHistory);
                this.listHistory();
                return true;
            }
        },
        deleteHistory: function(text){
            var id = this.getIDSearchHistory(text);
            if(id >= 0){
                delete SearchHistory[id];
                SearchHistory = this.clearEmpty(SearchHistory);
                this.setStorage("search-history", SearchHistory);                
                this.listHistory();
                return true;
            }else{
                return false;
            }
        },
        clearEmpty: function(arr){
            arr = arr.filter(function (el) { 
                return el; 
            }); 

            return arr;
        },
        getIDSearchHistory: function(text){
            var id =-1;
            var i =0;
            SearchHistory.forEach(function(item){
                if(item.Text == text){
                    id = i;
                }
                i++;
            });
            return id;
        },
        listHistory: function(){
            SearchHistory = this.getStorage("search-history");
            
            if(SearchHistory == null){
                console.log("search history is null.");
                this.setStorage("search-history", []);
                this.listHistory();
                return;
            }else{
                SearchHistory = this.clearEmpty(SearchHistory);
            }

            var HistoryHTML = '<ul>';
            SearchHistory.forEach(function(item){
                HistoryHTML +='<li > <span class="text">'+item.Text+'</span> <span class="delete" onclick="App.deleteHistory(this.parentNode.innerText.trim())"><i class="la la-close"></i></span> <span onclick="App.setSearchWord(this);" class="search"><i class="la la-search"></i> </span></li>';
            });

            HistoryHTML += '</ul>';
            if(SearchHistory.length==0){
                HistoryHTML = '<label>There is nothing in the search history.</label>';
            }
            this.getClassObject("SearchHistory").innerHTML = HistoryHTML;
        },
        setSearchWord: function(item){
            var text = item.parentNode.innerText.trim();
            SearchWord = text;
            this.getClassObject("searchinput").value =  SearchWord;
            this.SendSearchQuery();
        },
        getClassObject: function(text){
            return document.getElementsByClassName(text)[0];
        },
        SearchAWord: function(input){
            var text = input.value;
            text = text.trim();
            var searchbutton = this.getClassObject("searchbutton");
            if(text.length < 3){
                searchbutton.disabled = true;
                searchbutton.classList.add("disabled");
            }else{
                searchbutton.disabled = false;
                searchbutton.classList.remove("disabled");
            }
            SearchWord = text;

        },

        SendSearchQuery: function(){
            if(SearchWord.length>=3){
                this.addHistory(SearchWord);
            }
            var SearchResult = this.getClassObject("SearchResult");
            SearchResult.innerHTML = "Loading for result(s)...";
            SearchResults = [];
            this.getService(service+"?s="+ SearchWord +"&apikey="+Key, function(res){
                
                if(res.Response == "False"){
                    SearchResult.innerHTML = 'There is a service error. <i class="la la-frown"></i>'; 
                    return;
                }else{
                    var totalContainerWidth = res.Search.length* 210;

                    var ResultHTML = '<div class="result-container" style="width: '+ totalContainerWidth+'px">';
                    res.Search.forEach(function(item){
                        ResultHTML += '<span class="ResultCard card_id_'+ item.imdbID +'"> '+
                        '<div class="img"> <img src="'+ item.Poster+'" /></div>'+
                        '<div class="blur"></div>'+
                        '<div class="name">'+ item.Title +'</div>'+
                        '<div class="search_icon"> <i class="la la-search"> </i> </div>'+
                        '<div class="heart" onclick="App.addFavorites(this)" imdbid="'+ item.imdbID +'"> <i class="la la-heart"></i></div>'+
                        '</span>';
                    });
                    ResultHTML += '</div>';
                    var i = 0;
                    while(i<res.Search.length){
                        this.parent.App.getMovieDetailByID(res.Search[i].imdbID);                        
                        i++;
                    }

                   
                    SearchResult.innerHTML = ResultHTML;
                }

            });

        },
        getMovieDetailByID: function(id){
            this.getService(service+"?i="+ id +"&apikey="+Key, function(res){
                var card = this.parent.App.getClassObject("card_id_"+id);

                var date = res.Released;
                var runtime = res.Runtime;
                var rate = res.imdbRating;
                var totalPerson = res.imdbVotes;

                var dateObject = document.createElement("div");
                dateObject.classList.add("infolist");
                dateObject.innerHTML += '<span class="rating">'+ rate+'</span>'+
                '<span class="person">'+ totalPerson +'</span><br>'+
                '<span class="date">'+ date+'</span> <span class="runtime">'+ runtime +'</span>';

                card.append(dateObject);

                SearchResults.push(res);
            });
        },
        addFavorites: function(heartbutton){
            var imdbID = heartbutton.getAttribute("imdbid");
            var i = 0;
            var index = -1;
            SearchResults.forEach(function(item){
                if(item.imdbID == imdbID){
                    index = i;
                }
                i++;
            });

            var favMovie = SearchResults[index];
            FavoriteMovies.push(favMovie);
            this.setStorage("favorite-movies", FavoriteMovies);
            this.listFavorites();
        },
        removeFavorites: function(_imdbID){
            var id = -1;
            var i=0;
            var imdbid = _imdbID.getAttribute("imdbid");
            FavoriteMovies.forEach(function(item){
                if(item.imdbID == imdbid){
                    id = i;
                }
                i++;
            });

            delete FavoriteMovies[id];
            console.log(FavoriteMovies);
            FavoriteMovies = this.clearEmpty(FavoriteMovies);
            this.setStorage("favorite-movies", FavoriteMovies);
            this.listFavorites();
        },
        listFavorites: function(){
            FavoriteMovies = this.getStorage("favorite-movies");
           
            if(FavoriteMovies == null){
                console.log("favorite movies is null.");
                this.setStorage("favorite-movies", []);
                this.listFavorites();
                return;
            }else{
                FavoriteMovies = this.clearEmpty(FavoriteMovies);
            }

           
            var totalContainerWidth = FavoriteMovies.length* 210;
            var FavoritesHTML = "";
            var FavoritesHTML = '<div class="result-container" style="width: '+ totalContainerWidth+'px">';

            for(var i=FavoriteMovies.length-1; i> 0; i--){
                var item = FavoriteMovies[i];
                var date = item.Released;
                var runtime = item.Runtime;
                var rate = item.imdbRating;
                var totalPerson = item.imdbVotes;
                FavoritesHTML += '<span class="ResultCard card_id_'+ item.imdbID +'"> '+
                '<div class="img"> <img src="'+ item.Poster+'" /></div>'+
                '<div class="blur"></div>'+
                '<div class="name">'+ item.Title +'</div>'+
                '<div class="search_icon"> <i class="la la-search"> </i> </div>'+
                '<div class="heart" onclick="App.removeFavorites(this)" imdbid="'+ item.imdbID +'"> <i class="la la-heart-broken"></i></div>'+
                '<div class="infolist">'+
                    '<span class="rating">'+ rate+'</span>'+
                    '<span class="person">'+ totalPerson +'</span><br>'+
                    '<span class="date">'+ date+'</span> <span class="runtime">'+ runtime +'</span>'+                
                '</div>'+
                '</span>';
            }
            FavoritesHTML += '</div>';

            
            if(FavoriteMovies.length==0){
                FavoritesHTML = '<label>There is nothing in the search history.</label>';
            }
            this.getClassObject("Favorites").innerHTML = FavoritesHTML;
        },
        getService: function(_url, _callback){
            $.ajax({
                type:'get',
                url: _url,
                success: function(res){
                    _callback(res);
                }
            });
        }
        
    }

}();


