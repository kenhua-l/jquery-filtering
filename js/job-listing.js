// Structure the list item to append to $this
jQuery.fn.AppendJobItem = function(item) {
  var jobList = $('<li></li>');
  jobList.append('<p class="job-title">' + item.find('title').text() + '</p>');
  var jobTags = $('<ul class="job-tags"></ul>');
  if(item.find('type').length) {
    jobTags.append('<li>' + item.find('type').text() + '</li>');
  }
  if(item.find('department').length) {
    jobTags.append('<li>' + item.find('department').text() + '</li>');
  }
  if(item.find('date').length) {
    jobTags.append('<li>Posted ' + item.find('date').text() + '</li>');
  }
  jobList.append(jobTags);
  if(item.find('description').length) {
    jobList.append('<p class="job-description">' + item.find('description').text() + '</p>');
  }

  if(item.find('link').length) {
    jobList.append('<div class="action-btn">' +
                   '<a class="orange" href="' + encodeURI(item.find('link').text()) +
                   '" target="_blank">Apply Now</a></div>');
  }
  $(this).append(jobList);
}

// return array of pages listing the items
function paginate(total, toShow, datalist){
  var totalPages = Math.ceil(total / toShow);
  var pages = [];
  var bookmark = 0;
  for(var pageNumber = 1; pageNumber <= totalPages; pageNumber++){
    var page = $('<ul data-page=' + pageNumber + ' class="job-listings" aria-show="false"></ul>')
    for(var check = 0; check < toShow; check++) {
      page.AppendJobItem($(datalist[bookmark]));
      bookmark++;
      if(bookmark == total) break;
    }
    if(pageNumber == 1) page.attr('aria-show', 'true');
    pages.push(page);
  }
  return { pages: pages, totalPages: totalPages};
}

// show more button
function addShowMore($thiselem, totalPages) {
  // add elements
  var showNext = 2;
  $thiselem.append('<p id="results-status">Showing ' +
    $('.job-listings[aria-show="true"] > li').length + ' of ' +
    $('.job-listings > li').length + ' results</p>');
  if(showNext <= totalPages) {
    $thiselem.append('<div class="action-btn justify-content-center">' +
      '<button class="btn blue" type="button" id="show-more" data-shownext="'+
      showNext+'">Show More</button></div>');
  }
  // add function
  $('#show-more').on('click', function(){
    var shownext = $(this).data('shownext');
    $('.job-listings[aria-show="true"]').css('margin-bottom', '0');
    $('.job-listings[data-page="' + shownext + '"]').slideDown().attr('aria-show', 'true');
    if(shownext + 1 > totalPages){
      $(this).hide();
    } else {
      $(this).data('shownext', shownext + 1);
    }
    $('#results-status').text('Showing ' +
      $('.job-listings[aria-show="true"] > li').length + ' of ' +
      $('.job-listings > li').length + ' results');
  });
}

// pagination buttons
function addPagination($thiselem, totalPages, itemsPerPage) {
  // add elements
  var currentPage = 1;
  var firstItemIndex = ($('.job-listings[aria-show="true"]').data('page') - 1) * itemsPerPage + 1;
  var lastItemIndex = firstItemIndex + $('.job-listings[aria-show="true"] > li').length - 1;
  var resultsRange = $('.job-listings > li').length ? firstItemIndex + ' - ' + lastItemIndex : 0;
  $thiselem.append('<p id="results-status">Showing ' +
    resultsRange + ' of ' +
    $('.job-listings > li').length + ' results</p>');
  var ul = $('<ul class="action-btn pagination"></ul>');
  ul.append('<li><a class="page-link blue" href="#prev"><span class="fas fa-chevron-left"></span></a></li>');
  for(var i = 1; i <= totalPages; i++) {
    ul.append('<li><a class="page-link blue' + (i == currentPage ? ' active' : '') + '" href="#' + i + '">'+i+'</a></li>')
  }
  ul.append('<li><a class="page-link blue" href="#next"><span class="fas fa-chevron-right"></span></a></li>');
  $thiselem.append(ul);
  // add function
  $('.page-link').on('click', function() {
    var targetLink = parseInt($('.page-link.active').attr('href').substring(1));
    var pageLink = $(this).attr('href');
    if(pageLink.toLowerCase() != '#prev' && pageLink.toLowerCase() != '#next') {
      targetLink = parseInt(pageLink.substring(1));
    } else if (pageLink.toLowerCase() == '#prev' && targetLink != 1) {
      targetLink = targetLink - 1;
    } else if (pageLink.toLowerCase() == '#next' && targetLink != totalPages) {
      targetLink = targetLink + 1;
    }
    $('.page-link').removeClass('active');
    $('.page-link[href="#' + targetLink + '"]').addClass('active');
    $('.job-listings[aria-show="true"]').attr('aria-show', 'false').hide();
    $('.job-listings[data-page="' + targetLink + '"]').attr('aria-show', 'true').show();
    $('html, body').animate({
      scrollTop: $thiselem.parent().offset().top
    }, 500);
    firstItemIndex = ($('.job-listings[aria-show="true"]').data('page') - 1) * itemsPerPage + 1;
    lastItemIndex = firstItemIndex + $('.job-listings[aria-show="true"] > li').length - 1;
    resultsRange = firstItemIndex + ' - ' + lastItemIndex;
    $('#results-status').text('Showing ' +
      resultsRange + ' of ' +
      $('.job-listings > li').length + ' results');
  });
}

// init data
function listInit(data, $thiselem, itemsToShow, showMoreType) {
  $thiselem.empty();
  var numberOfJobs = data.length;
  itemsToShow = itemsToShow == -1 ? numberOfJobs : itemsToShow;
  // define number of items per page
  var pages = paginate(numberOfJobs, itemsToShow, data);
  pages.pages.forEach(function(item){
    $thiselem.append($(item));
  });
  // define how to paginate
  if(showMoreType.toLowerCase() == 'pagination'){
    addPagination($thiselem, pages.totalPages, itemsToShow);
  } else {
    addShowMore($thiselem, pages.totalPages);
  }
}

// add filter
function addTextFilter($thiselem) {
  // add elements
  var searchDiv = $('<div class="search-options form-row"></div>');
  searchDiv.append('<div class="form-group col-md-8">' +
    '<label class="sr-only" for="keyword">search keyword</label>' +
    '<input class="form-control" type="text" id="keyword" placeholder="Search for a keyword" / >' +
    '<p class="invalid-feedback">Please type in valid keyword and have at least 3 characters to search</p></div>');
  $thiselem.before(searchDiv);
}

function filterData(datalist, keyword, parameters) {
  var filteredData = [];
  keyword = keyword.toLowerCase();
  filteredData = datalist.toArray().filter(function(item) {
    var containsKeyword = false;
    parameters.forEach(function(param) {
      if($(item).find(param.toLowerCase()).text().toLowerCase().includes(keyword)) {
        containsKeyword = true;
      }
    })
    return containsKeyword;
  });
  return $(filteredData);
}

// add tags
function addTagsKeywords($thiselem, dataList) {
  // get data
  var categoriesKeywords = [];
  dataList.each(function(){
    if($(this).find('category').length) {
      var catArray = $(this).find('category').text().split(/\s*,\s*/);
      catArray.forEach(function(cat) {
        cat = cat.toLowerCase();
        if(!categoriesKeywords.includes(cat)) {
          categoriesKeywords.push(cat);
        }
      });
    }
  });
  // add elements
  var searchDiv;
  if($thiselem.prev('.search-options').length){
    searchDiv = $thiselem.prev('.search-options');
  } else {
    searchDiv = $('<div class="search-options form-row"></div>');
    $thiselem.before(searchDiv);
  }
  var tags = $('<ul class="tags col-12" id="categoriesFilter"></ul>')
  categoriesKeywords.forEach(function(cat) {
    tags.append('<li>' + cat + '</li>')
  });
  searchDiv.append(tags);
}

function categoriseData(datalist, activeCategories, parameter) {
  if (parameter === undefined) parameter = 'category'; // not useful
  var filteredData = [];
  filteredData = datalist.toArray().filter(function(item) {
    var containsKeyword = false;
    activeCategories.forEach(function(cat) {
      if($(item).find(parameter).text().toLowerCase().includes(cat)) {
        containsKeyword = true;
      }
    })
    return containsKeyword;
  });
  return $(filteredData);
}

// for when both searches are on
function filterAndCategoriseData(datalist, keyword, parameters, activeCategories) {
  var filteredData = [];
  if (catParameter === undefined) var catParameter = 'category'; // not useful
  filteredData = datalist.toArray().filter(function(item){
    var containsKeyword = false;
    activeCategories.forEach(function(cat) {
      if($(item).find(catParameter).text().toLowerCase().includes(cat)) {
        parameters.forEach(function(param) {
          if($(item).find(param.toLowerCase()).text().toLowerCase().includes(keyword)) {
            containsKeyword = true
          }
        })
      }
    })
    return containsKeyword;
  });
  return $(filteredData);
}

// Create a jquery function to populate list
jQuery.fn.ListJobs = function(options) {
  var $thiselem = $(this);
  // Function Object Parameter
  var dataFile = options.data || '';
  var itemsToShow = options.itemsToShow || -1; // to check integer
  var showMoreType = options.showMoreType || 'show-more'; // show-more
  var search = options.search || false; // true or false
  var searchParameters = options.searchParameters || ['title'];
  var categoryFilter = options.categoryFilter || false; // true or false
  var dataList;
  $.ajax({
    type: 'GET',
    url: dataFile,
    dataType: 'xml',
    success: function(data) {
      dataList = $(data).find('job');
      listInit(dataList, $thiselem, itemsToShow, showMoreType);
      // if has search and category
      if(search && categoryFilter) {
        addTextFilter($thiselem);
        addTagsKeywords($thiselem, dataList);
        var keyword;
        var activeCategories;
        var updatedData;
        $('#keyword').on('keyup', function(e){
          keyword = $('#keyword').val();
          activeCategories = $('#categoriesFilter li.active').toArray().map(function(cat){
            return $(cat).text();
          });
          event.preventDefault();
          if (event.keyCode === 13 && keyword.length >= 3) {
            $(this).removeClass('is-invalid');
            if(activeCategories.length) {
              updatedData = filterAndCategoriseData(dataList, keyword, searchParameters, activeCategories);
            } else {
              updatedData = filterData(dataList, keyword, searchParameters);
            }
            listInit(updatedData, $thiselem, itemsToShow, showMoreType);
          } else if (keyword.length == 0) {
            // reset with and without pressing enter
            $(this).removeClass('is-invalid');
            if(activeCategories.length) {
              updatedData = categoriseData(dataList, activeCategories);
            } else {
              updatedData = dataList;
            }
            listInit(updatedData, $thiselem, itemsToShow, showMoreType);
          } else if (event.keyCode === 13 && keyword.length < 3){
            $(this).addClass('is-invalid')
          }
        });
        $('#categoriesFilter li').on('click', function() {
          $(this).toggleClass('active');
          keyword = $('#keyword').val();
          activeCategories = $('#categoriesFilter li.active').toArray().map(function(cat){
            return $(cat).text();
          });
          if(activeCategories.length) {
            if (keyword.length >= 3) {
              updatedData = filterAndCategoriseData(dataList, keyword, searchParameters, activeCategories);
            } else if (keyword.length < 3) {
              updatedData = categoriseData(dataList, activeCategories);
            }
          } else {
            if (keyword.length >= 3) {
              updatedData = filterData(dataList, keyword, searchParameters);
            } else if (keyword.length < 3) {
              updatedData = dataList;
            }
          }
          listInit(updatedData, $thiselem, itemsToShow, showMoreType);
        });
      } else if(search) {
        // if has search only
        addTextFilter($thiselem);
        // add search function (done without callback for var assignment efficiency)
        $('#keyword').on('keyup', function(e){
          var keyword = $('#keyword').val();
          event.preventDefault();
          if (event.keyCode === 13 && keyword.length >= 3) {
            $(this).removeClass('is-invalid');
            var updatedData = filterData(dataList, keyword, searchParameters);
            listInit(updatedData, $thiselem, itemsToShow, showMoreType);
          } else if (keyword.length == 0) {
            // reset with and without pressing enter
            $(this).removeClass('is-invalid');
            listInit(dataList, $thiselem, itemsToShow, showMoreType);
          } else if (event.keyCode === 13 && keyword.length < 3){
            $(this).addClass('is-invalid')
          }
        })
      } else if (categoryFilter) {
        // if has tags search only
        addTagsKeywords($thiselem, dataList);
        $('#categoriesFilter li').on('click', function() {
          $(this).toggleClass('active');
          var activeCategories = $('#categoriesFilter li.active').toArray().map(function(cat){
            return $(cat).text();
          });
          if(activeCategories.length) {
            var updatedData = categoriseData(dataList, activeCategories);
            listInit(updatedData, $thiselem, itemsToShow, showMoreType);
          } else {
            // reset
            listInit(dataList, $thiselem, itemsToShow, showMoreType);
          }
        })
      }

    },
    error: function(error, text, thrown) {
      console.log(text);
    }
  })

}