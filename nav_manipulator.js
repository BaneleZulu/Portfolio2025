function nav_manipulator() {

  if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {

    tabsContainer.classList.add("float-nav");

    tabsContainer.classList.remove("navigate");

    tabsContainer.classList.remove("small-screen-nav");

  } else {

    tabsContainer.classList.remove("float-nav");

    tabsContainer.classList.add("navigate");

  }

}
