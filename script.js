const loadData = () => {
    fetch("/api/v1/usage")
        .then((response) => {
            if (response.status !== 200) {
                console.log(response);
            }
            return response;
        })
        .catch((error) => console.log(error));
};

// $(window).on("load", loadData);
