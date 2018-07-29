// API strings
const $dndAPI = 'http://www.dnd5eapi.co/api/';
const $spells = 'spells/';

// Spellbook elements
const $spellBookButton = $('#spell-book-dropdown');
const $spellSearchButton = $('#spell-search-btn')
const $spellDisplay = $('#spell-display');
const $spellBookContent = $('#spell-book-content');
const $spellSearchInput = $('#spell-search');

// Turns 1 into 1st, 2 into 2nd, etc.
// Only works on numbers 0-99
const ordinal_suffix_of = (i) => {
  var j = i % 10;
  if (j == 1 && i != 11) {
      return i + "st";
  }
  if (j == 2 && i != 12) {
      return i + "nd";
  }
  if (j == 3 && i != 13) {
      return i + "rd";
  }
  return i + "th";
}

// Removes characters incompatible with UTF-8
const stringFix = (str) => {
  var output = "";
  for (var i=0; i<str.length; i++) {
      if (str.charCodeAt(i) <= 127) {
          output += str.charAt(i);
      }
  }
   return output
}

// Code for formatting and printing spell data
const printSpell = (spell) => {
  // Spell name
  const name = spell.name;
  // Spell level
  const lvl = ordinal_suffix_of(spell.level) + "-level ";
  // Spell description
  const desc = stringFix(spell.desc[0]);
  // Casting Time
  const cTime = spell.casting_time;
  // Spell School
  const school = spell.school.name;
  // Spell Range
  const range = spell.range;
  // Spell Components
  const components = spell.components;

  let spellHTML = "";
  // Apply formatting HTML and add data
  spellHTML += `<div class="spell">`;
  spellHTML += `<p class="spell-name">`;
  spellHTML += name;
  spellHTML += `</p>`;
  spellHTML += `<p class="level-school">`;
  spellHTML += lvl + school;
  spellHTML += `</p>`
  spellHTML += `<p class="spell-desc">`;
  spellHTML += desc;
  spellHTML += `</p>`;
  spellHTML += `</div>`;
  // Set HTML to constructed HTML
  return spellHTML;
}

// Checks to see if 'str' contains 'contains'
// (returns true if it does)
const strContains = (str, contains) => {
  return (str.toLowerCase().indexOf(contains.toLowerCase()) >= 0);
}

// Accepts a JSON full of data representing a collection of
// objects to search through by name, using the user's search
// input to filter what is returned.
// This only returns indexes, so that these indexes can be used
// to make requests to the API for detailed spell data.
const getSearchIndexes = (searchContainer,searchTerm) => {
  let indexes = [];
  // For each item in the JSON
  $(searchContainer).each(function(i) {
    // Get the name of the object
    const $name = $(this)[0].name;
    // Compare the name to the search term, and
    // add it to the list of relative indexes to be returned
    // if the searchterm is found within the name.
    if(strContains($name,searchTerm)) {
      // The JSON's data is zero-indexed, but the API
      // is not, so add one to get the right index.
      indexes[indexes.length] = (i + 1);
    }
  });
  return indexes;
}

// Uses the indexes of spells returned by getSearchIndexes to
// build HTML content using the responseJSONs
const getSearchResults = (searchContainer,searchTerm,func) => {
  // Get the relative spell indexes for making detailed API
  // spell requests
  const indexes = getSearchIndexes(searchContainer,searchTerm)
  // If no spells were found, inform the user
  if(indexes.length == 0) {
    $spellDisplay.html("No results Found");
  } else {
    let htmlData = "";
    // For each relevant index
    $(indexes).each(function(i) {
      $.ajax({
          // Specific spell url
          url: $dndAPI + $spells+ indexes[i],
          mimeType: "text/html; charset=UTF-8",
          success: function(result) {
            // Add formatted spell data to the running html string
            htmlData += func($.parseJSON(result));
          },
          fail: function() {
            // On failure, add an error message to the html string
            htmlData += "<br>ERROR<br>";
          },
          complete: function() {
            // When each result returns, set the HTML and text alignment
            $spellDisplay.html(htmlData).css("text-align", "left");
          }
      });
    });
  }
}

$(document).ready(function() {
  // When the main spellbook button is clicked, hide or show the
  // search interface.
  $spellBookButton.click(function() {
    $spellBookContent.slideToggle(400);
  });
  // When the search button is clicked, run an API request to
  // retrieve any possibly relevant data based on the key entered.
  $spellSearchButton.click(function(e) {
    // Prevent this button from reloading the page
    e.preventDefault();
    // Put up some temporary text while the routine searches.
    // Also change text alignment to center
    $spellDisplay.html("Searching...").css("text-align", "center");
    // Grab all the spells from the API as a list
    $.ajax({
        url: $dndAPI + $spells,
        mimeType: "text/html; charset=UTF-8",
        success: function(result) {
          // On success, pass the spells to the search results function
          // along with the search input text and the function that will
          // ultimately format the data and add it to the page.
          getSearchResults($.parseJSON(result).results,
                          $spellSearchInput.val(),
                          printSpell);
        },
        fail: function() {
          // If the request to the API fails, print this detailed error message
          $spellDisplay.html("ERROR");
        }
    });
  });
});
