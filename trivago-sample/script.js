/* script.js — refactored */
(() => {
  const $doc = $(document);
  const SEL = {
    results: "#resultsList",
    sortBy: "#sortby > select",
    priceRange: "#priceRange",
    hotelLoc: "#hotelLocationDiv > select",
    propType: "#propertyTypeDiv > select",
    guestRate: "#guestRatingDiv > select",
    searchTerm: "#searchTerm",
    checkIn: "#checkindate",
    checkOut: "#checkoutdate",
    mapBtn: "#map > button",
    mapModal: "#mapModal iframe",
  };

  const FALLBACK = "/assets/img/hotel-fallback.jpg";
  const unique = (arr) => [...new Set(arr)];
  const byTextAsc = (a, b) => a.localeCompare(b);

  // ---------- Lazy Images ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ isIntersecting, target: img }) => {
        if (!isIntersecting || img.dataset.loaded) return;
        io.unobserve(img);
        img.onerror = () => {
          img.onerror = null;
          img.src = FALLBACK;
          img.dataset.loaded = "1";
          img.removeAttribute("data-src");
        };
        img.onload = () => {
          img.dataset.loaded = "1";
          img.classList.add("is-loaded");
        };
        img.src = img.dataset.src;
      });
    },
    { rootMargin: "200px" }
  );

  const registerLazyImages = (scope = document) => {
    (scope.jquery ? scope[0] : scope)
      .querySelectorAll("img.hotel-thumb:not([data-observed])")
      .forEach((img) => {
        img.dataset.observed = "1";
        io.observe(img);
      });
  };

  // ---------- Date helpers ----------
  const toDate = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  const addDays = (iso, n) => {
    const d = toDate(iso);
    d.setDate(d.getDate() + n);
    return toISO(d);
  };
  const diffDays = (a, b) => Math.max(0, (toDate(b) - toDate(a)) / 86400000);

  // ---------- DOM builders ----------
  const starSVG =
    '<span class="icon-ic star"><svg xmlns="http://www.w3.org/2000/svg" focusable="false" tabindex="-1" width="12" height="12" viewBox="0 0 12 12"><path class="svg-color--primary" fill="#F6AB3F" d="M11.988 5.21c-.052-.275-.27-.488-.545-.534l-3.604-.6L6.63.455C6.542.184 6.287 0 6 0s-.542.184-.632.456L4.16 4.076l-3.603.6c-.275.046-.493.26-.545.533-.052.273.072.55.312.695L3.2 7.63l-1.165 3.493c-.093.28.01.59.25.758.115.08.25.12.382.12.148 0 .295-.05.416-.146L6 9.52l2.917 2.333c.12.098.27.147.416.147.133 0 .267-.04.38-.12.244-.17.346-.478.252-.758L8.8 7.63l2.876-1.725c.24-.144.364-.422.312-.696z"></path></svg></span>';

  const el = (tag, cls, html) =>
    $(`<${tag}>`)
      .addClass(cls || "")
      .html(html || "");

  const createEntryCard = (entry) => {
    const filtersString = (entry.filters || []).map((f) => f.name).join(",");

    const $img = $("<img>")
      .addClass("hotel-thumb")
      .attr("src", FALLBACK)
      .attr("data-src", entry.thumbnail);

    const $imgWrap = el("div", "imgDiv").append($img);

    const $filters = el("span", "filters", filtersString).hide();
    const $name = el("h4", "hotelName", entry.hotelName);
    const $stars = el("p", "stars").attr("rating", entry.rating);
    for (let i = 0; i < entry.rating; i++) $stars.append(starSVG);
    $stars.append('<span class="hotelSpan">Hotel</span>');

    const ratingNo = String(entry.ratings?.no).includes(".")
      ? entry.ratings.no
      : `${entry.ratings?.no}.0`;
    const $ratings = el(
      "p",
      "ratings",
      `<span>${ratingNo}</span><span>${entry.ratings?.text || ""}</span>`
    );
    const $loc = el("p", "hotelLocation", entry.city);

    const $details = el("div", "hotelDetails").append(
      $filters,
      $name,
      $stars,
      $loc,
      $ratings
    );

    const $dealInfo = el(
      "div",
      "",
      `<span>Hotel Website</span><span class="price">$${entry.price}</span><span><span>1 night for</span> $${entry.price}</span>`
    );

    const $viewDeal = el("div", "viewDealDiv").append(
      $dealInfo,
      $(
        '<button class="btn"><span>View Deal</span><span class="icon-ic btn__ic btn__ic--deal-arrow icon-center icon-rtl"><svg xmlns="http://www.w3.org/2000/svg" focusable="false" tabindex="-1" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#37454D" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M9.5 7l5 5M9.5 17l5-5" class="svg-color--primary"></path></svg></span></button>'
      )
    );

    return $("<div>").append($imgWrap, $details, $viewDeal).hide();
  };

  // ---------- UI helpers ----------
  const setSliderGradient = ($range, value) => {
    const min = +$range.attr("min") || 0;
    const max = +$range.attr("max") || 100;
    const p = ((+value - min) / (max - min)) * 100;
    $range.css(
      "background",
      `linear-gradient(to right, #3f9fc1 0%, #3f9fc1 ${p}%, #cdd0d2 ${p}%, #cdd0d2 100%)`
    );
  };

  const populateSelect = ($sel, values) => {
    const frag = document.createDocumentFragment();
    values.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      frag.appendChild(opt);
    });
    $sel[0].appendChild(frag);
  };

  // ---------- Filtering ----------
  // ---------- Filtering (safe, card-scoped) ----------
  const applyFilters = () => {
    const text = $(SEL.searchTerm).val().trim();
    const priceLimit = +$(SEL.priceRange).val();
    const propType = $(SEL.propType).val(); // "-1" or "0..5"
    const guest = $(SEL.guestRate).val(); // "-1" or "a-b"
    const [gMin, gMax] = guest !== "-1" ? guest.split("-").map(Number) : [];
    const location = $(SEL.hotelLoc).val(); // "-1" or city
    const sortBy = $(SEL.sortBy).val(); // "-1" or filter name

    let $exclusiveCard = null; // when both name & city match

    // iterate over actual deal cards by finding their .price
    $(".price").each((_, priceEl) => {
      const $card = $(priceEl).closest(".viewDealDiv").parent(); // outer result card
      const name = $card.find(".hotelName").text() || "";
      const city = $card.find(".hotelLocation").text() || "";
      const ratingAttr = $card.find(".stars").attr("rating");
      const ratingVal = typeof ratingAttr !== "undefined" ? +ratingAttr : NaN;
      const guestNum = +($card.find(".ratings > span:first").text() || NaN);
      const filtersText = $card.find(".filters").text() || "";

      // price parsing robustly (e.g. "$1,234")
      const priceText = $(priceEl).text();
      const priceVal = +priceText.replace(/[^0-9.]/g, "");

      let show = true;

      if (text) {
        const up = text.toUpperCase();
        const nameHit =
          name.toUpperCase().includes(up) || up.includes(name.toUpperCase());
        const cityHit =
          city.toUpperCase().includes(up) || up.includes(city.toUpperCase());
        show = nameHit || cityHit;
        if (nameHit && cityHit) $exclusiveCard = $card; // mark exclusive
      }

      if (
        show &&
        Number.isFinite(priceLimit) &&
        Number.isFinite(priceVal) &&
        priceVal > priceLimit
      )
        show = false;
      if (show && propType != -1 && ratingVal != +propType) show = false;
      if (show && guest != -1 && (guestNum < gMin || guestNum > gMax))
        show = false;
      if (show && location != -1 && city !== location) show = false;
      if (show && sortBy != -1 && !filtersText.includes(sortBy)) show = false;

      $card.toggle(show);
    });

    // if both name & city matched for one card, hide others explicitly
    if ($exclusiveCard) {
      $("#resultsList > div").hide(); // hide all result cards
      $exclusiveCard.show(); // show only the exclusive one
    }
  };

  const updateTotalCost = () => {
    const ci = $(SEL.checkIn).val();
    const co = $(SEL.checkOut).val();
    const nights = diffDays(ci, co) || 1;
    $(".viewDealDiv").each((_, el) => {
      const $deal = $(el).children().eq(0);
      const price = +$deal.children().eq(1).text().split("$")[1];
      $deal
        .children()
        .eq(2)
        .html(
          nights > 1
            ? `<span>${nights} nights for</span> $${nights * price}`
            : `<span>1 night for</span> $${price}`
        );
    });
  };

  // ---------- Autocomplete (as-is, lightly tidied) ----------
  function autocomplete(inp, arr) {
    let currentFocus;
    inp.addEventListener("input", function () {
      const val = this.value;
      closeAllLists();
      if (!val) return false;
      currentFocus = -1;
      const a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      arr.forEach((item) => {
        if (item.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
          const b = document.createElement("DIV");
          b.innerHTML = `<strong>${item.substr(
            0,
            val.length
          )}</strong>${item.substr(
            val.length
          )}<input type='hidden' value='${item}'>`;
          b.addEventListener("click", function () {
            inp.value = this.getElementsByTagName("input")[0].value;
            closeAllLists();
          });
          a.appendChild(b);
        }
      });
    });
    inp.addEventListener("keydown", function (e) {
      let x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) addActive(++currentFocus, x);
      else if (e.keyCode == 38) addActive(--currentFocus, x);
      else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1 && x) x[currentFocus].click();
      }
    });
    const addActive = (i, x) => {
      if (!x) return;
      removeActive(x);
      if (i >= x.length) i = 0;
      if (i < 0) i = x.length - 1;
      x[i].classList.add("autocomplete-active");
      currentFocus = i;
    };
    const removeActive = (x) =>
      [...x].forEach((el) => el.classList.remove("autocomplete-active"));
    const closeAllLists = (elmnt) =>
      document
        .querySelectorAll(".autocomplete-items")
        .forEach(
          (list) =>
            elmnt !== list && elmnt !== inp && list.parentNode.removeChild(list)
        );
    document.addEventListener("click", (e) => closeAllLists(e.target));
  }

  // ---------- Init ----------
  $doc.ready(() => {
    const autoEntries = new Set();
    const citySet = new Set();
    const allFilters = new Set();

    $.ajax({
      dataType: "json",
      type: "get",
      url: "data.json",
      success: (data) => {
        const entries = data[1].entries || [];
        if (entries.length)
          $(SEL.mapModal).attr("src", entries[0].mapurl || "");

        let min = Infinity,
          max = -Infinity;

        const frag = document.createDocumentFragment();

        entries.forEach((e) => {
          autoEntries.add(e.city);
          citySet.add(e.city);
          autoEntries.add(e.hotelName);

          min = Math.min(min, e.price);
          max = Math.max(max, e.price);

          (e.filters || []).forEach((f) => allFilters.add(f.name));

          const $card = createEntryCard(e);
          $(frag).append($card[0]);
        });

        $(SEL.results)[0].appendChild(frag);
        registerLazyImages($(SEL.results));

        // Populate selects
        populateSelect($(SEL.sortBy), unique([...allFilters]).sort(byTextAsc));
        populateSelect($(SEL.hotelLoc), unique([...citySet]).sort(byTextAsc));

        // Price range
        $(SEL.priceRange).attr({ min, max, value: max });
        $("#priceLabels > span:last-child").text(`max: $${max}`);
        setSliderGradient($(SEL.priceRange), max);

        // Dates
        const today = toISO(new Date());
        $(SEL.checkIn).attr("min", today).val(today).trigger("change");
        $(SEL.checkOut).attr("min", addDays(today, 1)).val(addDays(today, 1));

        // Events
        $(".icon-ic.searchquery-icon.icon-center").on("click", () =>
          $(SEL.searchTerm).focus()
        );
        $(SEL.mapBtn).on("click", () => $("#mapModal").modal("show"));

        $(SEL.priceRange)
          .on("input", function () {
            setSliderGradient($(this), this.value);
          })
          .on("change", function () {
            $("#priceLabels > span:last-child").text(`max: $${this.value}`);
            applyFilters();
          });

        const syncPrevBtn = (wrapSel, dateSel) => {
          const $prev = $(`${wrapSel} .calendar-button-chevron--prev`);
          const atMin = $(dateSel).val() === $(dateSel).attr("min");
          $prev
            .toggleClass("btn-disabled not-allowed", atMin)
            .prop("disabled", atMin);
        };

        $(SEL.checkIn).on("change", function () {
          const v = $(this).val();
          if (!v) return;
          syncPrevBtn("#checkinDiv", SEL.checkIn);
          const minOut = addDays(v, 1);
          $(SEL.checkOut).attr("min", minOut);
          if (!$(SEL.checkOut).val() || $(SEL.checkOut).val() <= v) {
            $(SEL.checkOut).val(minOut).trigger("change");
          }
          updateTotalCost();
        });

        $(SEL.checkOut).on("change", function () {
          if (!this.value) return;
          syncPrevBtn("#checkoutDiv", SEL.checkOut);
          updateTotalCost();
        });

        // Chevron buttons (prev/next)
        $("#checkinDiv .calendar-button-chevron--prev").on("click", () => {
          const v = $(SEL.checkIn).val();
          if (!v) return;
          $(SEL.checkIn).val(addDays(v, -1)).trigger("change");
          $("#checkoutDiv .calendar-button-chevron--prev")
            .removeClass("btn-disabled not-allowed")
            .prop("disabled", false);
          updateTotalCost();
        });
        $("#checkoutDiv .calendar-button-chevron--prev").on("click", () => {
          const v = $(SEL.checkOut).val();
          if (!v) return;
          $(SEL.checkOut).val(addDays(v, -1)).trigger("change");
          updateTotalCost();
        });
        $("#checkinDiv .calendar-button-chevron--next").on("click", () => {
          const v = $(SEL.checkIn).val();
          if (!v) return;
          $(SEL.checkIn).val(addDays(v, 1)).trigger("change");
          updateTotalCost();
        });
        $("#checkoutDiv .calendar-button-chevron--next").on("click", () => {
          const v = $(SEL.checkOut).val();
          if (!v) return;
          $(SEL.checkOut).val(addDays(v, 1)).trigger("change");
          updateTotalCost();
        });

        // Filters
        $("#search").on("click", applyFilters);
        $(SEL.propType).on("change", applyFilters);
        $(SEL.guestRate).on("change", applyFilters);
        $(SEL.hotelLoc).on("change", applyFilters);
        $(SEL.sortBy).on("change", applyFilters);

        // Autocomplete
        autocomplete(
          document.getElementById("searchTerm"),
          unique([...autoEntries]).sort(byTextAsc)
        );

        updateTotalCost();
        $("body > #ajaxError").hide();
        $("body > #ajaxSuccess").show();
      },
      error: () => {
        $("body > #ajaxError > p").text(
          "Something went wrong. Please try again later."
        );
        $("body > #ajaxError").show();
        $("body > #ajaxSuccess").hide();
      },
    });
  });
})();
