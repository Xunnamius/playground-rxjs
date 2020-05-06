/* jshint esversion: 6 */
/* global Rx:false, console:false */

~function()
{
    console.log('Hello, Human.');
    console.info('With the comments gone and me not being verbose, this could be ONLY 30 LOC!!!');

    // Create a stream that runs on startup so things get going quick (see below XXX #2)
    //let startupRequestStream = Rx.Observable.just('https://api.github.com/users');

    // Create a stream of clicks of the refresh button
    let refreshButtonClickStream = Rx.Observable.fromEvent(document.querySelector('#refresh'), 'click');

    // Close button click streams
    let closeButtonClickStream = Rx.Observable.fromEvent(document.querySelectorAll('.close'), 'click');

    // Create a stream of requests as (request URI, time) pairs
    // let dataRequestStream = Rx.Observable.just('https://api.github.com/users');
    // XXX #1 : The startWith(null) line prepends "null" into the click stream
    // (we don't look at the events themselves, so who cares what it actually is)
    let dataRequestStream = refreshButtonClickStream
        .startWith(null)
        .map(() =>
        {
            let randomOffset = Math.floor(Math.random() * 500);
            return 'https://api.github.com/users?since=' + randomOffset;

        // XXX #2 : All the following are statup strategies if not using startWith to fake a click event!
        //}).merge(Rx.Observable.just('https://api.github.com/users'));
        //}).startWith('https://api.github.com/users'); // Ooh, explicit!
        //}).merge(startupRequestStream);
        });

    // And a stream of responses!
    let dataResponseStream = dataRequestStream.flatMap(requestURI =>
        Rx.Observable.fromPromise(fetch(requestURI).then(response => response.json()))
    );

    // Turn the responses into JSON
    let RefreshDOMUpdaterStream = dataResponseStream.map(responseJSON =>
    {
        let randomStartIndex = Math.floor(Math.random() * (responseJSON.length - 3));
        let threeRandomUsers = responseJSON.slice(randomStartIndex, randomStartIndex + 3);
        return threeRandomUsers;
    });

    // Listen to refresh requests on this specific DOMUpdater stream
    RefreshDOMUpdaterStream.subscribe(users =>
    {
        let elements = document.querySelectorAll('.users li span');
        users.forEach((user, index) =>
        {
            elements[index].innerText = user.login;
        });
    });

    // Listen to the close button click stream and refresh when an emission happens
    closeButtonClickStream.withLatestFrom(dataResponseStream).subscribe(emission =>
    {
        let [event, cachedResponseJSON] = emission;
        let randomStartIndex = Math.floor(Math.random() * cachedResponseJSON.length);
        let randomUser = cachedResponseJSON[randomStartIndex];

        event.target.parentElement.querySelector('span').innerText = randomUser.login;
    });
}();
