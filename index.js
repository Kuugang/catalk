let userId;
let focusedPost;
let profileId;
let profileActivity;
let username;
let posts = []
let postsLen
// let postFocusTemplate;
// let postsTemplate
let onFocus = false
let focusedId
let activeNavUserProfile;
let originalPosts

function showOverlay(){
    $(".overlay").removeClass("hidden")

    $(".overlay").on("click", function(){
        removeOverlay;
    })
}

function removeOverlay(){
    $(".overlay").addClass("hidden")
}

function clearRecentPosts(){
    let recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];
    let userEntry = recentPosts.find(entry => entry.id === userId);
    userEntry.recentPosts = []
    localStorage.setItem("recentPosts", JSON.stringify(recentPosts));
    $("#recent-posts-container").html("")
}

function getUserRecentPosts(){
    let recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];
    const userEntry = recentPosts.find(entry => entry.id === userId);

    return userEntry.recentPosts;
}

function updateRecentPosts(posts){
    let recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];
    const userEntry = recentPosts.find(entry => entry.id === userId);
    if(userEntry.recentPosts.length === 0){
        clearRecentPosts();
        return
    }

    userEntry.recentPosts = userEntry.recentPosts.map(item => {
        const newPost = posts.find(post => post.id === item.id);
        return newPost || null; 
    }).filter(item => item !== null);

    localStorage.setItem("recentPosts", JSON.stringify(recentPosts));
    renderRecentPosts()
}

function renderRecentPosts(){
    if(userId === undefined)return;
    let recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];
    const userEntry = recentPosts.find(entry => entry.id === userId);
    if(userEntry && userEntry.recentPosts.length > 0){
        renderData(userEntry.recentPosts, userId, $("#recent-posts-container"), $("#recent-posts-template"));
    }
}

function newPost(postId) {
    $(`#${postId}`).addClass("bg-[#3B82F6]");

    setTimeout(function () {
        $(`#${postId}`).removeClass("bg-[#3B82F6]");
    }, 3000);

    if (window.scrollY > 200){
        const button = `<button id="new-post-button" class="fixed top-[15%] left-1/2 -translate-x-1/2 bg-white p-3 rounded-full">
            <div class="flex flex-row items-center gap-2">
                <p class="font-semibold">New Post</p>
                <i class="fa-solid fa-arrow-up top-4" style="animation: up 1.5s infinite;"></i>
            </div>
        </button>`;

        $("body").append(button);

        $("#new-post-button").on("click", function () {
            $(this).remove();
            $(`#${postId}`)[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        });
    }
}


if (localStorage.userId) {
    userId = localStorage.userId;
    profileId = userId
    username = localStorage.username
    checkUser()
}

if(!localStorage.pinnedPosts){
    localStorage.setItem("pinnedPosts", []);
}

// if(!localStorage.recentPosts){
//     localStorage.setItem("recentPosts", []);
// }

Handlebars.registerHelper('getUserState', function() {
    return userId !== undefined; 
});
 
Handlebars.registerHelper('getUsername', function() {
    return username; 
});

Handlebars.registerHelper('isNotEmpty', function(array, options) {
    if (Array.isArray(array) && array.length > 0) {
        return true 
    } else {
        return false
    }
});


function checkUser(){
    if(userId){
        $("#registerBtn, #loginBtn").hide();
        $("#signOutBtn").show();
        $("#createPostBtn").show();
        $("#sidebar-button").show();
        if(username.length > 0){
            $("#currentUser").text(username)
        }else{
            $("#currentUser").text("Anon")
            $("#currentUser").addClass("italic")
        }
    }else{
        $("#registerBtn, #loginBtn").show();
        $("#signOutBtn").hide();
        $("#createPostBtn").hide();
        $("#sidebar-button").hide();
    }
}

// function showToast(message) {
//     const postsTemplate = $("#newPostToast").html();
//     const template = Handlebars.compile(postsTemplate);
//     const html = template();

//     const toastContainer = $("#toast-container");

//     toastContainer.append(html);

//     setTimeout(() => {
//         toastContainer.children().first().remove();
//     }, 5000);
// }


$("#searchInput").on("input", function() {
    const input = $("#searchInput");
    const query = input.val().toLowerCase(); 
    const filteredPosts = posts.filter(item => {
        const postText = item.post.toLowerCase();
        const replyText = item.reply ? item.reply.map(replyItem => replyItem.reply.toLowerCase()).join(" ") : '';
        const authorName = item.user.toLowerCase(); 
        const replyAuthorName = item.reply ? item.reply.map(replyItem => replyItem.user.toLowerCase()).join(" ") : '';
        return postText.includes(query) || replyText.includes(query) || authorName.includes(query) || replyAuthorName.includes(query);
    });
    renderData(filteredPosts, userId, $("#posts-container"), $("#posts"))
});

function openSideDrawer(){
    $("#drawer").removeClass('translate-x-full');

    showOverlay()
    $(".overlay").click(function (event) {
        if (event.target == this) {
            closeSideDrawer(); 
            removeOverlay();
        }
    });
}

function closeSideDrawer(){
    $("#drawer").addClass('translate-x-full');
}

$(document).on("click", "#sidebar-button", function () {
    profileActivity = getProfileActivity(userId, posts)

    renderData(profileActivity, userId, $("#activity"), $("#activities"))
    const drawer = $('#drawer');

    if (drawer.hasClass('translate-x-full')) {
        openSideDrawer(); 
    } else {
        closeSideDrawer();
    }
});
    
// $.ajax({
//     url: "./postFocus.hbs",
//     method: "GET",
//     dataType: "html",
//     success: function(templateContent){
//         postFocusTemplate = templateContent;                    
//     }
// })

// $.ajax({
//     url: "./posts.hbs",
//     method: "GET",
//     dataType: "html",
//     success: function(templateContent){
//         postsTemplate = templateContent;                    
//     }
// })
function deepEqual(x, y) {
    if (x === y) {
        return true;
      }
      else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
        if (Object.keys(x).length != Object.keys(y).length)
          return false;
    
        for (var prop in x) {
          if (y.hasOwnProperty(prop))
          {  
            if (! deepEqual(x[prop], y[prop]))
              return false;
          }
          else
            return false;
        }
    
        return true;
      }
      else 
        return false;
}

function getArrayDifferences(arr1, arr2) {
    const differences = [];
    for (let i = 0; i < arr1.length; i++) {
        if(deepEqual(arr1[i], arr2[i]) === false){
            // console.log(arr1[i], arr2[i])
            break;
        }
        // if (!deepEqual(arr1[i], arr2[i])) {
        //     differences.push({ index: i, value1: arr1[i], value2: arr2[i] });
        // }
    }
    return differences;
}


function getPosts() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "https://apiparasaapinisir.vercel.app/forumGetPosts",
            // url: "http://localhost:8080/",
            // url: "http://hyeumine.com/forumGetPosts.php",
            data : {
                // page : parseInt()
            },
            success: (result) => {
                originalPosts = result
                resolve(result.reverse());
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.error("An error occurred:", thrownError);
                reject(thrownError);
            }
        });
    });
}

function reRenderUserProfilePage(){
    if(activeNavUserProfile == "posts"){
        const userPosts = getUserPosts(profileId, posts);            
        renderData(userPosts, profileId, $("#userContentContainer"), $("#posts"));
    }
        
    if(activeNavUserProfile === "overview"){
        const userActivity = getProfileActivity(profileId, posts);
        renderData(userActivity, profileId, $("#userContentContainer"), $("#posts"));
    }

    if(activeNavUserProfile === "pins"){
        const pins = getUserPinnedPost(profileId)
        renderData(pins, userId, $("#userContentContainer"), $("#posts"));
    }

    if(activeNavUserProfile === "comments"){
        const comments = getUserComments(profileId)
        renderData(comments, profileId, $("#userContentContainer"), $("#userComments"));
    }
}

setInterval(() => {
    getPosts()
        .then(result => {
            // const update = getArrayDifferences(result, posts)
            const checkUpdate = deepEqual(posts, result)
            if(checkUpdate === false){
                if(result.length > posts.length){
                    if(result[0].uid !== userId){
                        newPost(result[0].id);
                    }
                }
                if(profileId !== undefined){
                    posts = result
                    reRenderUserProfilePage(); 
                    // ToDo only update if naay changes sa recent posts based on the new data
                    updateRecentPosts(result)
                }

                posts = result;
                renderData(posts, userId, $("#posts-container"), $("#posts"))
                
                if(onFocus === true){
                    createFocusedPostTemplate(focusedPost, userId, $("#mainPostFocusContainer"));
                    createFocusedPostTemplate(focusedPost, userId, $("#userProfileFocusContainer"));
                }
            }
        })
        .catch(error => {
            console.error("Error in getPosts:", error);
        });
},2000);



function sortByPinnedPosts(a, b) {
    const pinnedA = a.isPinned ? a.pinnedTimestamp || 0 : 0;
    const pinnedB = b.isPinned ? b.pinnedTimestamp || 0 : 0;

    if (pinnedB - pinnedA !== 0) {
        return pinnedB - pinnedA;
    }
    return 0;
}

function renderData(posts, userNameId, container, template) {
    const data = JSON.parse(JSON.stringify(posts));

    const pins = getUserPinnedPost(userNameId)

    data.forEach(data => {
        userNameId === data.uid ? data.postOwner = true : data.postOwner = false;
        data.replyCount = 0;
        if (data.reply && Array.isArray(data.reply)) {
            data.reply.forEach(element => {
                if (element.reply.length > 0) {
                    data.replyCount++;
                }
            });
        }
        data.isPinned = false;
        data.pinnedTimestamp = null;
        if (pins) {
            const pinnedPost = pins.find(pin => pin.id === data.id);
            if (pinnedPost) {
                data.isPinned = true
                data.pinnedTimestamp = pinnedPost.timestamp;
            }
        }
    });

    if (pins) {
        data.sort(sortByPinnedPosts);
    }
    template = Handlebars.compile(template.html());
    const context = { data: data };
    const html = template(context);
    container.html(html);
}


function getUserPinnedPost(id) {
    const data = JSON.parse(JSON.stringify(posts));
    const userPinnedPostsJSON = localStorage.getItem('pinnedPosts');

    if (!userPinnedPostsJSON) {
        return []; 
    }

    const userPinnedPosts = JSON.parse(userPinnedPostsJSON);

    const pinnedPosts = userPinnedPosts
        .filter(item => item.userId === id)
        .flatMap(item => item.pins.map(pin => ({ postId: pin.postId, timestamp: pin.timestamp })));

    const pinnedPostIds = pinnedPosts.map(pin => pin.postId);

    const postsWithTimestamp = data.map(post => {
        const pinnedPost = pinnedPosts.find(pin => pin.postId === post.id);
        if (pinnedPost) {
            post.timestamp = pinnedPost.timestamp;
        }
        return post;
    });

    return postsWithTimestamp.filter(item => pinnedPostIds.includes(item.id));
}



function getPinnedPosts(){
    const existingPinnedPostsJSON = localStorage.getItem('pinnedPosts');
    let existingPinnedPosts = [];

    if (existingPinnedPostsJSON) {
        existingPinnedPosts = JSON.parse(existingPinnedPostsJSON);
    }

    return existingPinnedPosts;
}

function pinPost(button) {
    let timestamp = new Date().getTime();

    const postId = button.id;
    const existingPinnedPosts = getPinnedPosts();

    const pinnedPostIndex = existingPinnedPosts.findIndex(pin => pin.userId === userId);

    if (pinnedPostIndex !== -1) {
        let pinnedPost = existingPinnedPosts[pinnedPostIndex];
        let pinIndex = pinnedPost.pins.findIndex(pin => pin.postId === postId);

        if (pinIndex !== -1) {
            pinnedPost.pins.splice(pinIndex, 1);
        } else {
            pinnedPost.pins.push({ postId: postId, timestamp: timestamp });
        }
    } else {
        existingPinnedPosts.push({
            userId: userId,
            pins: [{ postId: postId, timestamp: timestamp }]
        });
    }
    

    localStorage.setItem('pinnedPosts', JSON.stringify(existingPinnedPosts));
    renderData(posts, userId, $("#posts-container"), $("#posts"))
    renderData(posts, userId, $("#userContentContainer"), $("#posts"))
}

function getUserPosts(profileId, posts){
    let data = JSON.parse(JSON.stringify(posts));

    data = data.filter(item => {
        const id = item.uid;
        return id === profileId 
    });

    return data
}

function getUserComments(profileId){
    const activity =  getProfileActivity(profileId, posts);
    let comments = []
    activity.forEach(item =>{
        if(item.reply){
            (item.reply).forEach(reply => {
                if(reply.uid === profileId){
                    reply.postParent = item.id
                    comments.push(reply)
                }
            })
        }
    })
    return comments
}

function getProfileActivity(profileId, posts){
    let data = JSON.parse(JSON.stringify(posts));

    data = data.filter(item => {
        const id = item.uid;
        const replyText = item.reply ? item.reply.map(replyItem => replyItem.uid) : [];
        return id === profileId || replyText.includes(profileId);
    });
    return data
}

function createFocusedPostTemplate(post, usernameId, container) {
    let postData = JSON.parse(JSON.stringify(post));
    if(postData !== undefined){
        if(postData.reply){
            (postData.reply).forEach(reply => {
                reply.uid === userId ? reply.replyOwner = true : reply.replyOwner = false;
                reply.uid === postData.uid ? reply.postOP = true : reply.postOP = false 
            });
        }

        postData.uid == usernameId ? postData.postOwner = true : postData.postOwner = false

        const template = Handlebars.compile($("#postFocus").html())
        const context = { data: postData};
        const html = template(context);
        container.html(html)
    }
    $(".postFocusContainer").removeClass("hidden")
}

function createUserProfileTemplate(posts, profileId, username){
    let data = JSON.parse(JSON.stringify(posts));
    profileActivity = getProfileActivity(profileId, data);

    const isMainUser = userId === profileId ? true : false;
    const template = Handlebars.compile($("#userProfile").html());
    const context = { username : username, isMainUser : isMainUser};
    const html = template(context)
    $("main").html(html);
    $("#profileOverviewButton").addClass("active");
    activeNavUserProfile = "overview"
    renderData(profileActivity, profileId, $("#userContentContainer"), $("#posts"))
}

function createMainPageTemplate(posts, profileId, username){
    let data = JSON.parse(JSON.stringify(posts));
    const template = Handlebars.compile($("#main-page-template").html());
    const context = { data: data};
    const html = template(context)
    $("main").html(html);
    renderData(data, profileId, $("#posts-container"), $("#posts"))
}

function openForm($form) {
    $form.show(100);
    $("#registerBtn, #loginBtn, #signOutBtn").prop("disabled", true);
    $(".overlay").removeClass("hidden");
}

function closeForms() {
    $(".registerContainer, .loginContainer, .createPostContainer, #signOutConfirm").hide();
    $("#registerBtn, #loginBtn, #signOutBtn").prop("disabled", false);
    $(".overlay").html("")
    $(".overlay").addClass("hidden");
}

function displaySpinner(){
    $(".spinner").removeClass("hidden")
}
function hideSpinner(){
    $(".spinner").addClass("hidden")
}

function handleCreatePost(id, message){
    return new Promise((resolve, reject) => {
        $.ajax({ 
            type: "POST",
            url : "https://apiparasaapinisir.vercel.app/forumNewPost",
            // url: "http://hyeumine.com/forumNewPost.php",
            data: {
                post: message,
                id: id,
            },
            success : (data) => {
                resolve(data)
            },
            error : (error) => {
                reject(error);
            }
        });
        } 
    )
}

async function createNewPost(event){
    event.preventDefault()
    const message = $("#message").val();

    displaySpinner();
    try{
        handleCreatePost(userId, message)
            .then((data) => {
                getPosts()
                    .then((data) => {
                        renderData(data, userId, $("#posts-container"), $("#posts"))
                        renderData(getProfileActivity(userId, data), userId, $("#userContentContainer"), $("#posts"))
                    })
                    .then(() => {
                        $("#message").val('');
                        hideSpinner();
                        closeForms();
                    })
        })
    }catch(error){
        console.log("Something went wrong", error)
    }
}

function handleDeletePost(postId){
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            // url: "http://hyeumine.com/forumDeletePost.php",
            url : "https://apiparasaapinisir.vercel.app/forumDeletePost",
            data : {
                id : parseInt(postId)
            },
            success : (data) => {
                resolve(data)
            },
            error : (error) =>{
                reject(error)
            }
        })
    })
}

async function deletePost(postId){
    displaySpinner()
    try {
        await handleDeletePost(postId);
        $(`#${postId}.post-item`).remove()
        hideSpinner()
        closeForms();
        closePostFocus()
    } catch (error) {
        alert("Something went wrong");
        console.log(error)
    }
} 

function handleReply(postId, message) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            // url: "http://hyeumine.com/forumReplyPost.php",
            url : "https://apiparasaapinisir.vercel.app/forumReplyPost",
            data: {
                user_id: userId,
                post_id: postId,
                reply: message
            },
            success: (data) => {
                resolve(data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

async function replyPost(postId) {
    const message = $("#replyMessage").val()
    displaySpinner()
    try {
        await handleReply(postId, message);

        getPosts()
            .then((data) =>{                
                renderData(data , userId, $("#posts-container"), $("#posts"))
                renderData(getProfileActivity(profileId, data), profileId, $("#userContentContainer"), $("#posts"))
                focusedPost = data.find(item => item.id === postId)

                hideSpinner()
                $(".overlay").html("")

                createFocusedPostTemplate(focusedPost, userId, $("#mainPostFocusContainer"))
                createFocusedPostTemplate(focusedPost, userId, $("#userProfileFocusContainer"))
            })
    } catch (error) {
        alert("Something went wrong")
        console.log(error)
    }
}

function handleDeleteReply(replyId){
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url : "https://apiparasaapinisir.vercel.app/forumDeleteReply",
            data : {
                id: replyId
            },
            // url: `http://hyeumine.com/forumDeleteReply.php?id=${replyId}`,
            success: (data) =>{
                resolve(data)
            },
            error: (error) => {
                reject(error)
            }
        })
    })
}

async function deletePostReply(replyId){
    displaySpinner()
    try{
        getPosts()
            .then((data) =>{
                posts = data
                for (const post of posts) {
                    if (post.reply) {
                        post.reply.forEach(item => {
                            if(item.id === replyId){
                                focusedPost = post
                                focusedPost.reply = focusedPost.reply.filter(reply => reply.id !== replyId);
                                handleDeleteReply(replyId);
                            } 
                        })
                    }
                } 
                $(".overlay").html("")

                renderData(posts, userId, $("#posts-container"), $("#posts"))
                renderData(getProfileActivity(profileId, posts), profileId, $("#userContentContainer"), $("#posts"))

                createFocusedPostTemplate(focusedPost, userId, $("#mainPostFocusContainer"));
                createFocusedPostTemplate(focusedPost, userId, $("#userProfileFocusContainer"))
                hideSpinner()
            }) 
    }catch(error){
        console.log("Something went wrong", error);
    }
}
function handleUserLogin(loginUsername) {
    return new Promise((resolve, reject) => {
        $.ajax({
        type : "POST",
        // url: "http://hyeumine.com/forumLogin.php",
        url : "https://apiparasaapinisir.vercel.app/forumLogin",
        data : {
            username: loginUsername,
        },
        success: (data) => {
            try{
                // data = JSON.parse(data)
                userId = data.user.id;
                username = loginUsername
                localStorage.setItem("userId", userId);
                localStorage.setItem("username", username);
                renderData(posts, userId, $("#posts-container"), $("#posts"))
                checkUser()
                resolve(data)
            }catch(error){
                console.log(error)    
                reject(error)
            }
            },
        })

    });
}
function viewProfile(){
    closeSideDrawer()
    removeOverlay();
    profileId = userId
    createUserProfileTemplate(posts, profileId, username)
    window.scrollTo({top: 0}); 
}

function closePostFocus(){
    $(".postFocusContainer").html("")
    $(".postFocusContainer").addClass("hidden")
    removeOverlay();

    $('.posts-container .post-item').removeClass("bg-[#3B82F6]");
    $('.posts-container .post-item').removeClass("border-[#1C1917]");

    onFocus = false
}

document.onkeydown = function(e){
    switch (e.keyCode){
        case 27:
            closeForms();
            closePostFocus();
            closeSideDrawer();
            removeOverlay();
            break;
    }
}

function noUserError() {
    const overlay = $('<div class="overlay" id="overlay"></div>');

    overlay.click(function (event) {
        if (event.target === this) {
        overlay.remove()
        closeForms();
        }
    });

    const error = $(
        '<div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">'
    );

    error.append('<p class="font-bold">Error!</p>');
    error.append("<p>Invalid User Credentials!</p>");

    overlay.append(error);

    $("body").append(overlay);
}
window.addEventListener('scroll', function() {
  if (window.scrollY > 200) {
    $("#backToTop").removeClass("hidden");
  } else {
    $("#backToTop").addClass("hidden");
  }
});
function backToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}
$("#logo").on("click", () => {
    if(posts.length == 0)return;
    createMainPageTemplate(posts, userId, $("main"));
})
$(document).ready( function(){
    checkUser()
    getPosts()
        .then((result) => {
            posts = [...result]
            // console.log(posts)
            renderRecentPosts();
            // createUserProfileTemplate(posts, '2009', "fried milk")
            renderData(result, userId, $("#posts-container"), $("#posts"));
            $("main").removeClass("hidden")
            $(".posts-loader").addClass("hidden")
        })
        .catch((error) => {
            console.error("Error getting posts:", error);
        }); 
        

    $("#register").on("submit", function(e) {
        e.preventDefault();
        const registerLastName = $("#registerLastName").val();
        const registerFirstName = $("#registerFirstName").val();
        const registerUserName = $("#registerUserName").val()
        $.ajax({
            type: "POST",
            url : "https://apiparasaapinisir.vercel.app/forumCreateUser",
            // url: "http://hyeumine.com/forumCreateUser.php",
            data: {
                lastName : registerLastName,
                firstName : registerFirstName,
                username: registerUserName 
            },
            success: (data) => {
                userId = data.id
                username = data.username
                localStorage.setItem("userId", userId);
                localStorage.setItem("username", username);
                checkUser();
            }
        })
        closeForms();
    })


    $("#login").on("submit", async function(e) {
        e.preventDefault(); 

        displaySpinner();
        const loginUsername = $("#loginUserName").val();

        try {
            await handleUserLogin(loginUsername);
        } catch (error) {
            console.log("Something went wrong" + error);
        } finally {
            hideSpinner();
            closeForms();
            renderRecentPosts()
            if(onFocus)createFocusedPostTemplate(focusedPost, userId, $("#mainPostFocusContainer")) 
        }
    });

    $("#signOutBtn").bind("click", function(){
        openForm($("#signOutConfirm"));
        $("#signoutCancelButton").on("click", function(){
            closeForms();
        })
        $("#signoutConfirmButton").on("click", function(){
            localStorage.removeItem("userId")
            localStorage.removeItem("username")
            location.reload();
        })
    })

    $("#registerBtn").on("click", function () {
        openForm($(".registerContainer"));
    });

    $("#loginBtn").on("click", function () {
        openForm($(".loginContainer"));
    });

    $("#createPostBtn").on("click", function () {
        openForm($(".createPostContainer"));
    });

    $(".overlay").on("click", function (event) {
        if ($(event.target).hasClass("overlay")) {
            closeForms();
        }
    });

    $('#activity').on('click', '.post-item', function() {
        const id = $(this).attr('id');
        focusedPost = posts.find(item => item.id === id)

        showOverlay();

        $('.posts-container .post-item').removeClass("bg-[#3B82F6]");
        $('.posts-container .post-item').removeClass("border-[#1C1917]");

        $(`#${id}`).addClass("bg-[#3B82F6]");
        $(`#${id}`).addClass("border-[#1C1917]");

        $(`#${id}`)[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center'});

        createFocusedPostTemplate(focusedPost, userId, $("#mainPostFocusContainer"))
        createFocusedPostTemplate(focusedPost, profileId, $("#userProfileFocusContainer"))

        closeSideDrawer()
    });



    $(document).on("click", ".post-item", function (event) {
        const id = $(this).attr("id");
        const post = posts.find(post => post.id === id);
        if(!userId){
            return
        }
        let recentPosts = JSON.parse(localStorage.getItem("recentPosts")) || [];
        const userEntry = recentPosts.find(entry => entry.id === userId);

        if (userEntry) {
            if((userEntry.recentPosts.find(item => item.id === id)
) !== undefined)return;

            userEntry.recentPosts.push(post);

            if(userEntry.recentPosts.length > 5){
                userEntry.recentPosts.splice(0, 1)
            }
        } else {
            recentPosts.push({ id: userId, recentPosts: [post] });
        }
        localStorage.setItem("recentPosts", JSON.stringify(recentPosts));
        renderRecentPosts()
    });
    

    $(document).on('click', '.posts-container .post-item', function(event) {
        if (!$(event.target).hasClass("userLink")) {
            onFocus = true;
            showOverlay();
            $('.posts-container .post-item').not(this).removeClass("bg-[#3B82F6]");
            $('.posts-container .post-item').not(this).removeClass("border-[#1C1917]");
    
            const target = event.target;
    
            $(".overlay").on("click", function(){
                closePostFocus();
            });
    
            if(!$(target).hasClass("interact")){
                $(this).addClass("bg-[#3B82F6]");
                $(this).addClass("border-[#1C1917]");
    
                focusedId = $(this).attr('id');
                focusedPost = posts.find(item => item.id === focusedId);
    
                createFocusedPostTemplate(focusedPost, userId, $("#mainPostFocusContainer"));
                createFocusedPostTemplate(focusedPost, userId, $("#userProfileFocusContainer"));
            }
        }
    });
    

    $(document).on("click", ".userLink", function(event){
        const id = $(this).attr('id')
        profileId = id
        let postItem = posts.find(post => post.uid === id);

        if(id == "currentUser"){
            createUserProfileTemplate(posts, userId, username);
            closeSideDrawer();
        }else{
            if (!postItem) {
                const postWithReply = posts.find(post => post.reply && post.reply.some(reply => reply.uid === id));
                if (postWithReply) {
                    postItem = postWithReply.reply.find(reply => reply.uid === profileId);
                }
            }

            const username = postItem.user;
            createUserProfileTemplate(posts, profileId, username);
        }

        window.scrollTo({top: 0}); 
        closePostFocus();
    })

    $(document).on("click", "#userProfileActivityButtonContainer button", function(e) {
        $("#userProfileActivityButtonContainer button").removeClass("border-b-4 border-blue-500 active");

        $(this).addClass("border-b-4 border-blue-500 active");

        const buttonId = $(this).attr("id")

        if(buttonId === "profilePostsButton"){
            activeNavUserProfile = "posts"
            const userPosts = getUserPosts(profileId, posts);            
            renderData(userPosts, profileId, $("#userContentContainer"), $("#posts"));
        }
        
        if(buttonId === "profileOverviewButton"){
            activeNavUserProfile = "overview"
            const userActivity = getProfileActivity(profileId, posts);
            renderData(userActivity, profileId, $("#userContentContainer"), $("#posts"));
        }

        if(buttonId === "profilePinsButton"){
            activeNavUserProfile = "pins"
            const pins = getUserPinnedPost(profileId)
            renderData(pins, userId, $("#userContentContainer"), $("#posts"));
        }

        if(buttonId === "profileCommentsButton"){
            activeNavUserProfile = "comments"
            const comments = getUserComments(profileId)
            renderData(comments, profileId, $("#userContentContainer"), $("#userComments"));
        }
    });
});