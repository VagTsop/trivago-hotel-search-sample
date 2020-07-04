$(document).ready(function() {
    let autocompleteEntries = [];
    let cities = [];
    $.ajax({
        dataType: 'json',
        type: 'get',
        url: 'data.json',
        success: function(data) {
            let max = -Infinity;
            let min = Infinity;
            let filters = [];
            const entries = data[1].entries;
            $('#mapModal iframe').attr('src', entries[0].mapurl);
            entries.forEach(function(entry) {
                if (!autocompleteEntries.includes(entry.city)) {
                    autocompleteEntries.push(entry.city);
                    cities.push(entry.city); // this keeps only cities and will be used to population hotel location filter.
                }
                if (!autocompleteEntries.includes(entry.hotelName)) {
                    autocompleteEntries.push(entry.hotelName); 
                }
                if (entry.price > max) {
                    max = entry.price;
                }
                if (entry.price < min) {
                    min = entry.price;
                }
                const entryFilters = entry.filters;
                let filtersString = "";
                entryFilters.forEach(function(filter) {
                    if (!filters.includes(filter.name)) {
                        filters.push(filter.name);
                    }
                    filtersString = filtersString + filter.name + ',';
                })
                // creation of each entry
                const outerDiv = $(document.createElement('div'));
                const imgDiv = $(document.createElement('div'));
                $(imgDiv).addClass('imgDiv');
                const img = $(document.createElement('img'))
                $(img).attr('src', entry.thumbnail);
                $(imgDiv).append(img);
                $(outerDiv).append(imgDiv);                
                const hotelDetailsDiv = $(document.createElement('div'));
                $(hotelDetailsDiv).addClass('hotelDetails');
                const filtersSpan = $(document.createElement('span'));
                $(filtersSpan).addClass('filters');
                $(filtersSpan).text(filtersString);
                $(filtersSpan).hide();
                $(hotelDetailsDiv).append(filtersSpan);
                const h4 = $(document.createElement('h4'));                
                $(h4).addClass('hotelName');
                $(h4).text(entry.hotelName);
                $(hotelDetailsDiv).append(h4);
                const stars = $(document.createElement('p'));
                $(stars).addClass('stars');
                $(stars).attr('rating', entry.rating);
                for (let i = 0; i < entry.rating; i++){
                    $(stars).append('<span class="icon-ic star">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" tabindex="-1" width="12" height="12" viewBox="0 0 12 12">' +
                                            '<path class="svg-color--primary" fill="#F6AB3F" d="M11.988 5.21c-.052-.275-.27-.488-.545-.534l-3.604-.6L6.63.455C6.542.184 6.287 0 6 0s-.542.184-.632.456L4.16 4.076l-3.603.6c-.275.046-.493.26-.545.533-.052.273.072.55.312.695L3.2 7.63l-1.165 3.493c-.093.28.01.59.25.758.115.08.25.12.382.12.148 0 .295-.05.416-.146L6 9.52l2.917 2.333c.12.098.27.147.416.147.133 0 .267-.04.38-.12.244-.17.346-.478.252-.758L8.8 7.63l2.876-1.725c.24-.144.364-.422.312-.696z"></path>' +
                                        '</svg>' +
                                    '</span>')
                }
                $(stars).append('<span class="hotelSpan">Hotel</span>');
                $(hotelDetailsDiv).append(stars);
                const hotelLocation = $(document.createElement('p'));
                $(hotelLocation).addClass('hotelLocation')
                $(hotelLocation).text(entry.city);
                $(hotelDetailsDiv).append(hotelLocation);
                const ratings = $(document.createElement('p'));
                $(ratings).addClass('ratings');
                const ratingNum = $(document.createElement('span'));
                $(ratingNum).text(entry.ratings.no == (entry.ratings.no + '.0') ? (entry.ratings.no + '.0') : entry.ratings.no);
                $(ratings).append(ratingNum);
                const ratingText = $(document.createElement('span'));
                $(ratingText).text(entry.ratings.text);
                $(ratings).append(ratingText);
                $(hotelDetailsDiv).append(ratings);                
                $(outerDiv).append(hotelDetailsDiv);
                const viewDealDiv = $(document.createElement('div'));
                $(viewDealDiv).addClass('viewDealDiv');
                const dealDiv = $(document.createElement('div'));
                const span1 = $(document.createElement('span'));
                $(span1).text('Hotel Website');
                $(dealDiv).append(span1);
                const span2 = $(document.createElement('span'));
                $(span2).addClass('price');
                $(span2).text('$' + entry.price);
                $(dealDiv).append(span2);
                $(dealDiv).append('<span><span>1 night for</span> $' + entry.price + '</span>')
                $(viewDealDiv).append(dealDiv);
                $(viewDealDiv).append('<button class="btn">' +
                                        '<span>View Deal</span>' +
                                            '<span class="icon-ic btn__ic btn__ic--deal-arrow icon-center icon-rtl">' +
                                                '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" tabindex="-1" width="24" height="24" viewBox="0 0 24 24">' +
                                                    '<path fill="none" stroke="#37454D" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M9.5 7l5 5M9.5 17l5-5" class="svg-color--primary"></path>' +
                                                '</svg>' +
                                            '</span>' +
                                        '</button>');
                $(outerDiv).append(viewDealDiv);
                $(outerDiv).hide();
                $('#resultsList').append(outerDiv);
            })
            filters.sort();
            filters.forEach(function(filter) {
                const option = $(document.createElement('option'));
                $(option).attr('value',filter);
                $(option).text(filter);
                $('#sortby > select').append(option);
            })
            cities.sort();
            cities.forEach(function(city) {
                const option = $(document.createElement('option'));
                $(option).attr('value',city);
                $(option).text(city);
                $('#hotelLocationDiv > select').append(option);
            })
            $('#priceRange').attr('min', min);
            $('#priceRange').attr('max', max);
            $('.icon-ic.searchquery-icon.icon-center').click(function(){
                $('#searchTerm').focus();
            });
            $('#checkinDiv > div').click(function(e) {
                e.stopPropagation();
                let elem = $('#checkindate');
                if (elem.hasClass('focused')) {
                    elem.blur();
                    elem.removeClass('focused');
                }
                else {
                    elem.focus();
                    elem.addClass('focused');
                }
            });            
            $('#checkindate').click(function(e) {
                e.stopPropagation();
                $(this).addClass('focused');
            });
            $('#checkoutDiv > div').click(function(e) {
                e.stopPropagation();
                let elem = $('#checkoutdate');
                if (elem.hasClass('focused')) {
                    elem.blur();
                    elem.removeClass('focused');
                }
                else {
                    elem.focus();
                    elem.addClass('focused');
                }
            });
            $('#checkoutdate').click(function(e) {
                e.stopPropagation();
                $(this).addClass('focused');
            });
            $('.calendar-button-chevron--prev').click(function(e) {
                e.stopPropagation();
            });
            $('.calendar-button-chevron--next').click(function(e) {
                e.stopPropagation();
            });
            $('#map > button').click(function() {
                $('#mapModal').modal('show');
            })
            $('#priceRange').change(function() {
                $('#priceLabels > span:last-child').text('max: $' + $(this).val());
            })
            max = $('#priceRange').attr('max');
            $('#priceRange').val(max);
            $('#priceLabels > span:last-child').text('max: $' + $('#priceRange').val());
            $('#priceRange').on('input', function() {
                const value = +$(this).val();
                const min = +$(this).attr('min');
                const max = +$(this).attr('max');
                const percentage = ((value-min) / (max-min)) * 100;
                $(this).css('background', 'linear-gradient(to right, #3f9fc1 0%, #3f9fc1 ' + percentage + '%, #cdd0d2 ' + percentage + '%, #cdd0d2 100%)');
            });
            $('#priceRange').css('background', 'linear-gradient(to right, #3f9fc1 0%, #3f9fc1 ' + $("#priceRange").val() + '%, #cdd0d2 ' + $("#priceRange").val() + '%, #cdd0d2 100%)');        
            $('#checkindate').change(function() {
                const value = $(this).val();
                if (value != "") {
                    const min = $(this).attr('min');
                    if (value == min) {
                        $('#checkinDiv button.calendar-button-chevron--prev').addClass('btn-disabled');
                        $('#checkinDiv button.calendar-button-chevron--prev').addClass('not-allowed');
                        $('#checkinDiv .calendar-button-chevron--prev').prop('disabled', true);
                    }
                    else {
                        $('#checkinDiv button.calendar-button-chevron--prev').removeClass('btn-disabled');                        
                        $('#checkinDiv button.calendar-button-chevron--prev').removeClass('not-allowed');
                        $('#checkinDiv .calendar-button-chevron--prev').prop('disabled', false);
                    }
                    $('#checkoutdate').attr('min', GetNextDayDate(value));
                    const value2 = $('#checkoutdate').val();
                    if(value2 == '' || value2 <= value) {
                        $('#checkoutdate').val(GetNextDayDate(value));
                        $('#checkoutdate').trigger('change');
                    }
                }
                else {
                    $('#checkoutdate').attr('min', '');
                    $('#checkoutdate').val('');
                    $('#checkoutdate').trigger('change');
                }
            })
            $('#checkoutdate').change(function() {
                const value = $(this).val();
                if (value != "") { 
                    const min = $(this).attr('min');
                    if (value == min) {
                        $('#checkoutDiv button.calendar-button-chevron--prev').addClass('btn-disabled');
                        $('#checkoutDiv button.calendar-button-chevron--prev').addClass('not-allowed');
                        $('#checkoutDiv .calendar-button-chevron--prev').prop('disabled', true);
                    }
                    else {
                        $('#checkoutDiv button.calendar-button-chevron--prev').removeClass('btn-disabled');
                        $('#checkoutDiv button.calendar-button-chevron--prev').removeClass('not-allowed');
                        $('#checkoutDiv .calendar-button-chevron--prev').prop('disabled', false);
                    }
                }
            })
            $('#checkinDiv .calendar-button-chevron--prev').click(function() {
                const value = $('#checkindate').val();
                if (value != '') {
                    $('#checkindate').val(GetPreviousDayDate(value));
                    $('#checkindate').trigger('change');
                    $('#checkoutDiv button.calendar-button-chevron--prev').removeClass('btn-disabled');
                    $('#checkoutDiv button.calendar-button-chevron--prev').removeClass('not-allowed');
                    $('#checkoutDiv .calendar-button-chevron--prev').prop('disabled', false);
                    updateTotalCost()
                }
            })
            $('#checkoutDiv .calendar-button-chevron--prev').click(function() {
                const value = $('#checkoutdate').val();
                if (value != '') {
                    $('#checkoutdate').val(GetPreviousDayDate(value));
                    $('#checkoutdate').trigger('change');
                    updateTotalCost()
                }
            })
            $('#checkinDiv .calendar-button-chevron--next').click(function() {
                const value = $('#checkindate').val();
                if (value != '') {
                    $('#checkindate').val(GetNextDayDate(value));
                    $('#checkindate').trigger('change');
                    updateTotalCost()
                }
            })
            $('#checkoutDiv .calendar-button-chevron--next').click(function() {
                const value = $('#checkoutdate').val();
                if (value != '') {
                    $('#checkoutdate').val(GetNextDayDate(value));
                    $('#checkoutdate').trigger('change');
                    updateTotalCost()
                }
            })
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            const year = today.getFullYear();
            const date = year + '-' + month + '-' + day
            $('#checkindate').attr('min', date);
            $('#checkindate').val(date);
            $('#checkindate').trigger('change');
            $('#search').click(hideOrShow)
            $('#priceRange').change(hideOrShow)
            $('#propertyTypeDiv > select').change(hideOrShow)
            $('#guestRatingDiv > select').change(hideOrShow)
            $('#hotelLocationDiv > select').change(hideOrShow)
            $('#sortby > select').change(hideOrShow)
            /*initiate the autocomplete function on the "searchTerm" element, and pass along the cities array as possible autocomplete values*/
            autocomplete(document.getElementById("searchTerm"), autocompleteEntries);                        
            updateTotalCost();          
            $('body > #ajaxError').hide();
            $('body > #ajaxSuccess').show();
        },
        error: function() {
            $('body > #ajaxError > p').text('Something went wrong. Please try again later.');
            $('body > #ajaxError').show();
            $('body > #ajaxSuccess').hide();
        }
    });
    function IsLeapYear (year) {
        if (year % 4 == 0 && year % 100 != 0) {
            return true;
        } else if (year % 400 == 0) {
            return true;
        } else {
            return false;
        }
    }
    function GetPreviousDayDate(date) {
        const splitted = date.split("-");
        let year = +splitted[0];
        let month = +splitted[1];
        let day = +splitted[2];
        day = day - 1;
        if (day == 0 && month == 3 && !IsLeapYear(year)) {
            day = '28';
            month = '02';
        } else if (day == 0 && month == 3 && IsLeapYear(year)) {
            day = '29';
            month = '02';
        } else if (day == 0 && (month == 2 || month == 4 || month == 6 || month == 8 || month == 9 || month == 11)) {
            day = '31';
            month = month - 1;
            if (month < 10) {
                month = '0' + month;
            }         
        } else if (day == 0 && month != 1) {
            day = '30';
            month = month - 1;
            if (month < 10) {
                month = '0' + month;
            }
        } else if (day == 0) {
            day = '31';
            month = '12';
            year = year - 1;
        } else {
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
        }
        if (year < 10) {
            year = '000' + year;
        } else if (year < 100) {
            year = '00' + year;
        } else if (year < 1000) {
            year = '0' + year;
        } 
        return year + '-' + month + '-' + day;
    }
    function GetNextDayDate(date) {
        const splitted = date.split("-");
        let year = +splitted[0];
        let month = +splitted[1];
        let day = +splitted[2];
        day = day + 1;
        if (day == 29 && month == 2 && !IsLeapYear(year)) {
            day = '01';
            month = '03';
        } else if (day == 30 && month == 2 && IsLeapYear(year)) {
            day = '01';
            month = '03';
        } else if (day == 31 && (month == 4 || month == 6 || month == 9 || month == 11)) {
            day = '01';
            month = month + 1;
            if (month < 10) {
                month = '0' + month;
            }         
        } else if (day == 32 && month != 12) {
            day = '01';
            month = month + 1;
            if (month < 10) {
                month = '0' + month;
            }
        } else if (day == 32) {
            day = '01';
            month = '01';
            year = year + 1;
        } else {
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
        }
        if (year < 10) {
            year = '000' + year;
        } else if (year < 100) {
            year = '00' + year;
        } else if (year < 1000) {
            year = '0' + year;
        } 
        return year + '-' + month + '-' + day;
    }    
    // autocomplete (Code from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_autocomplete)
    function autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function(e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false;}
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
                }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode == 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
                }
            }
        });
        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
            }
        }
        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
            }
        }
        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }
    function updateTotalCost() {
        let checkindate = $('#checkindate').val();
        const checkoutdate = $('#checkoutdate').val();
        let nights = 0;
        while (checkindate != checkoutdate) {
            nights = nights + 1;
            checkindate = GetNextDayDate(checkindate);
        }
        const array = $('.viewDealDiv');
        for (let i = 0; i < array.length; i ++){
            const dealDiv = $(array[i]).children()[0];
            const price = +$(dealDiv).children()[1].innerText.split('$')[1];
            if (nights > 1) {
                $(dealDiv).children()[2].innerHTML ='<span>' + nights + ' nights for</span> $' + (nights * price);
            } else {
                $(dealDiv).children()[2].innerHTML = '<span>1 night for</span> $' + price;
            }
        }
    }
    function hideOrShow(){
        const text = $('#searchTerm').val();
        const priceLimit = +$('#priceRange').val();
        const propertyType = $('#propertyTypeDiv > select').val();
        const guestRatings = $('#guestRatingDiv > select').val();
        const guestRatingsMin = +guestRatings.split('-')[0];
        const guestRatingsMax = +guestRatings.split('-')[1];
        const hotelLocation = $('#hotelLocationDiv > select').val();
        const sortBy = $('#sortby > select').val();
        const results = $('#resultsList').children();
        const hotelNames = $('.hotelName');
        const stars = $('.stars');
        const hotelLocations = $('.hotelLocation');
        const ratings = $('.ratings');
        const prices = $('.price');
        const sortByFilters = $('.filters');
        let show = false;
        let hotelNameInput = false;
        let hotelLocationInput = false;
        for (let i = 0; i < results.length; i++) {
            if ($.trim(text) != ''){                                                     
                if(text.toUpperCase().includes(hotelNames[i].innerText.toUpperCase()) || hotelNames[i].innerText.toUpperCase().includes(text.toUpperCase())) {
                    hotelNameInput = true;
                } else {
                    hotelNameInput = false;
                }
                if (text.toUpperCase().includes(hotelLocations[i].innerText.toUpperCase()) || hotelLocations[i].innerText.toUpperCase().includes(text.toUpperCase())) {
                    hotelLocationInput = true;
                } else {
                    hotelLocationInput = false;
                }
                if (hotelNameInput == true && hotelLocationInput == true) {
                    show = true;                                            
                } else {
                    if (hotelNameInput == true) {
                        show = true;
                    } else if (hotelLocationInput == true) {
                        show = true;
                    } else {    
                        show = false;
                    }
                }
            }
            else {
                show = true;
            }
            if (+prices[i].innerText.split('$')[1] > priceLimit) {
                show = false;
            } else if (propertyType != -1 && $(stars[i]).attr('rating') != propertyType) {
                show = false;
            } else if (guestRatings != -1 && (+$(ratings[i]).children()[0].innerText < guestRatingsMin || +$(ratings[i]).children()[0].innerText > guestRatingsMax)) {
                show = false;
            } else if (hotelLocation != -1 && hotelLocations[i].innerText != hotelLocation) {
                show = false;
            } else if (sortBy != -1 && !sortByFilters[i].innerText.includes(sortBy)) {
                show = false;
            }
            if (show == true) {
                $(results[i]).show();
            } else {
                $(results[i]).hide();
            }
            if (hotelNameInput == true && hotelLocationInput == true) {
                for (let j = 0; j < results.length; j++) {
                    if (j != i) {
                        $(results[j]).hide();
                    }
                }
                break;
            }
        }
    }
})