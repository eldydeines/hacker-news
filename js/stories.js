"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let solidHeart = '<i class="fas fa-heart"></i>';
let emptyHeart = '<i class="far fa-heart"></i>';
let heart = "";

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
   
      ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  let id = 0;
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    /*  let heartStatus = currentUser.favorites.some(favorite => favorite.storyId === story.storyId);
     if (heartStatus) {
       heart = solidHeart;
     }
     else heart = emptyHeart; */

    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);


    $allStoriesList.show();
  }
}

function putFavoritesOnPage() {

  $favoriteStories.empty();
  let id = 0;
  console.log($favoriteStories);
  // loop through all of our stories and generate HTML for them
  for (let favorite of currentUser.favorites) {

    const $favorite = generateStoryMarkup(favorite);

    $favoriteStories.append($favorite);

    /*  let liId = $favorite.attr("id");
        let $heart = $favorite.find(`#fave-${id}`);
    
        $heart.on("click", function (event) {
          currentUser.removeFavorite(liId);
          let elementClicked = event.currentTarget;
          console.log(elementClicked);
          elementClicked.innerHTML = `${emptyHeart}`;
          elementClicked.remove();
        });
        id += 1;
    
     */

  }
  hidePageComponents();
  $favoriteStories.show();
}

$favoriteStories.on("click", putFavoritesOnPage);


function addMyStoriesOnPage() {

  $myStories.empty();
  console.log(currentUser.ownStories)
  for (let story of currentUser.ownStories) {
    heart = "<span></span>";
    const $story = generateStoryMarkup(story);
    $myStories.append($story);
  }
  hidePageComponents();
  $myStories.show();
}


/** Handle story form submission. Sets up new instances of Story and StoryList */
async function submitNewStory(evt) {
  console.debug("submit", evt);
  evt.preventDefault();

  // grab the story details
  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  await storyList.addStory(currentUser, { author, title, url });

  $newStoryForm.trigger("reset");
  getAndShowStoriesOnStart();
  hidePageComponents();
  $allStoriesList.show();

}

$newStoryForm.on("submit", submitNewStory);





/** Make favorite/not-favorite star for story */

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}



async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(storyId);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(storyId);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);