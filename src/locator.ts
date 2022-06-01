import {
  defaultQuery,
  enableAutocomplete,
  loadLocationsOnLoad,
  locationInput,
  searchButton,
  useMyLocation
} from "./locator/constants";
import { getLocations, getNearestLocationsByString, getUsersLocation} from "./locator/locations";
import { getQueryParamsFromUrl } from "./locator/utils";
import { isLoading } from "./locator/loader";
// @ts-ignore
import google from "google";



searchButton.addEventListener("click", function () {
  $('#offset').val(0);    
  getNearestLocationsByString();
});

/*
useMyLocation.addEventListener("click", function () {
  getUsersLocation();
});
*/






window.addEventListener("popstate", function (e) {
  if (e.state && e.state.queryString) { 
    locationInput.value = e.state.queryString;
    getNearestLocationsByString();
   
  }
});

window.addEventListener("load", function () { 
  const params = getQueryParamsFromUrl();
  const queryString = params["q"] || defaultQuery;
  locationInput.value = decodeURI(queryString);
  getNearestLocationsByString();  
 
});

locationInput.addEventListener("keydown", function (e) { 
  if (e.key === "Enter") {
   getNearestLocationsByString();
  }
});


locationInput.addEventListener("keyup", function (e) { 
  
    if(locationInput.value.trim() ==""&&e.key ==="Backspace"){
       getNearestLocationsByString();
     }
  
});



if (loadLocationsOnLoad) {
  getLocations(0,true);
  // getDepartments();
}

const search =locationInput;
const matchlist =document.getElementById('match-list');


const searhStates = async searchText =>{
  const res =await fetch('https://liveapi-sandbox.yext.com/v2/accounts/me/entities?limit=10&offset=0&sortBy=[{%22name%22:%22ASCENDING%22}]&filter=%7B%7D&api_key=b262ae7768eec3bfa53bfca6d48e4000&v=20181201&resolvePlaceholders=true&entityTypes=location&savedFilterIds=946153154');
  const states =await res.json();
  const searchres=states.response.entities;

  let matches =searchres.filter(state=>{
    const regex =new RegExp(`^${searchText}`,'gi');
    //const city=state.address.city;
    const res=state.name.match(regex);
    return res;
  });  
  console.log(matches);
  if(searchText.length===0){
    matches=[];
    matchlist.innerHTML='';
  }
  
  outputHtml(matches);
};
const outputHtml=matches=>{
  if(matches.length>0){
    const html =matches.map(match=>
      // alert(match.address.city)
      `<div class="py-2 px-5 cursor-pointer">
      <h6 class="name-value hover:text-[#02aab0]" id="${match.name}">${match.name}</h6> <span class="text-pri
      mary"${match.address.countryCode}>
      </div>
      `).join('');
    matchlist.innerHTML =html;
  }
} 
$(document).on('click', '.name-value', function() {       
  console.log($(this).attr('id'));
  const input_val=$(this).attr('id');
  $('#location-input').val(input_val);
  getNearestLocationsByString();
   $('#match-list').empty();
});


search.addEventListener('input',()=>searhStates(search.value));

if (enableAutocomplete) {
  const autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("location-input"),
    {
      options: {
        //types: ["(regions)"],
        componentRestrictions: {'country': "us"}
      },
    }
  );
  autocomplete.addListener("place_changed", () => {
    if (!isLoading) {
        getNearestLocationsByString();
      
    }
  });
}
