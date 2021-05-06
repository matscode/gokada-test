import React, { useState, useEffect } from "react";
import FI from "./FI";
import { MapLoader } from "../Map";

export default function Delivery() {
    const [map, setMap] = useState(null);
    const [infoWindow, setInfoWindow] = useState(null);
    const [placesService, setPlacesService] = useState(null);

    const [pickupMarker, setPickupMarker] = useState(null);
    const [dropoffMarker, setDropoffMarker] = useState(null);
    const [location, setLocation] = useState({
        lat: 6.6439384,
        lng: 3.3456939
    });
    const [currentFocus, setCurrentFocus] = useState(null);
    const [pickup, setPickup] = useState({});
    const [dropoff, setDropoff] = useState({});
    const [addressResult, setAddressResult] = useState([]);
    const [directionRenderer, setDirectionRenderer] = useState(null);

    const handleAddressInput = e => {
        placesService.findPlaceFromQuery(
            {
                query: e.target.value,
                fields: ["formatted_address", "name", "geometry", "place_id"],
                locationBias: {
                    radius: 50000,
                    center: location
                }
            },
            function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log(JSON.parse(JSON.stringify(results)));
                    setAddressResult(JSON.parse(JSON.stringify(results)));
                }
            }
        );
    };

    const selectAddress = (address, currentFocus, e) => {
        e.preventDefault();
        // hide dropdown
        setAddressResult([]);
        setCurrentFocus(null);

        const location = address.geometry.location;
        let ltb = null;

        map.panTo(location);

        if (currentFocus === "pickup") {
            setPickup(address);
            pickupMarker.setPosition(location);
            setLocation(location);

            if (dropoff.geometry) {
                ltb = new google.maps.LatLngBounds(
                    new google.maps.LatLng(location.lat, location.lng),
                    new google.maps.LatLng(
                        dropoff.geometry.location.lat,
                        dropoff.geometry.location.lng
                    )
                );
            }
        } else if (currentFocus === "dropoff") {
            setDropoff(address);
            if (dropoffMarker) {
                dropoffMarker.setPosition(location);
            } else {
                setDropoffMarker(
                    new google.maps.Marker({
                        position: location,
                        map,
                        icon: "/img/marker-map-pin.svg"
                    })
                );
            }

            if (pickup.geometry) {
                ltb = new google.maps.LatLngBounds(
                    new google.maps.LatLng(
                        pickup.geometry.location.lat,
                        pickup.geometry.location.lng
                    ),
                    new google.maps.LatLng(location.lat, location.lng)
                );
            }
        }

        if (ltb) {
            new google.maps.DirectionsService().route(
                {
                    origin: ltb.getNorthEast(),
                    destination: ltb.getSouthWest(),
                    avoidFerries: true,
                    travelMode: google.maps.TravelMode.DRIVING
                },
                (r, s) => {
                    if (s === google.maps.DirectionsStatus.OK) {
                        map.fitBounds(ltb, { top: 200, bottom: 110 });
                        map.panToBounds(ltb);

                        directionRenderer.setOptions({
                            directions: r,
                            polylineOptions: {
                                geodesic: true,
                                strokeColor: "#363",
                                strokeWidth: "1px"
                            },
                            suppressMarkers: true,
                            preserveViewport: true
                        });
                        directionRenderer.setMap(map);
                    }
                }
            );
        }
    };

    const getUserLocation = e => {
        e.preventDefault();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(location);
                pickupMarker.setPosition(location);
                map.setCenter(location);
            });
        }
    };

    const initMap = () => {
        const map = new google.maps.Map(document.getElementById("map"), {
            center: location,
            zoom: 15,
            minZoom: 3,
            // gestureHandling: "none",
            mapId: "e919b6e8a77242b0",
            disableDefaultUI: true
        });

        setDirectionRenderer(new google.maps.DirectionsRenderer());
        const infoWindow = new google.maps.InfoWindow();

        setMap(map);
        setInfoWindow(infoWindow);
        setPlacesService(new google.maps.places.PlacesService(map));

        setPickupMarker(
            new google.maps.Marker({
                position: location,
                map,
                icon: "/img/marker-stop-circle.svg"
            })
        );
    };

    // load and mount the map
    useEffect(() => {
        MapLoader.load().then(initMap);

        return () => {
            // do some clean up
        };
    }, []);

    return (
        <section className="delivery">
            <section id="map"></section>

            <section id="locationWrapper" className="p-3">
                <div className="text-center text-capitalize d-flex justify-content-between align-items-center w-100">
                    <a
                        href="#"
                        className="d-inline-flex align-items-center text-dark"
                        onClick={e => {
                            e.preventDefault();
                            setCurrentFocus(null);
                            setAddressResult([]);
                        }}
                    >
                        <FI icon="chevron-left" className="bg-transparent"></FI>
                        Back
                    </a>

                    <h5 className="m-0">{currentFocus || "Parcel request"}</h5>

                    <a
                        href="#"
                        className="d-inline-flex align-items-center text-dark invisible"
                    >
                        <FI icon="chevron-left" className="bg-transparent"></FI>
                        Back
                    </a>
                </div>

                <section className="locationInputFields">
                    {currentFocus !== "dropoff" && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="pickup"
                                defaultValue={pickup.name}
                                className="form-control"
                                placeholder="Pickup address"
                                onChange={handleAddressInput}
                                onFocus={e => setCurrentFocus(e.target.name)}
                            />
                            <p className="text-muted">
                                {pickup.formatted_address}
                            </p>
                        </div>
                    )}

                    {currentFocus !== "pickup" && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="dropoff"
                                defaultValue={dropoff.name}
                                className="form-control"
                                placeholder="Dropoff address"
                                onChange={handleAddressInput}
                                onFocus={e => setCurrentFocus(e.target.name)}
                            />
                            <p className="text-muted">
                                {dropoff.formatted_address}
                            </p>
                        </div>
                    )}
                </section>

                {addressResult.length > 0 && (
                    <ul className="locationSuggestions list-unstyled pt-4">
                        <li
                            className="list-item d-flex align-items-center py-2"
                            key="currentLocation"
                        >
                            <div className="mr-2">
                                <FI icon={"crosshair"}></FI>
                            </div>{" "}
                            <a
                                href="#"
                                onClick={e =>
                                    alert('Please, select location from your search result')
                                }
                                disabled
                                className="d-block address-item flex-grow-1"
                            >
                                <h6 className="font-weight-bold">
                                    Current location
                                </h6>
                                {/* <p className="text-muted">
                                    {each.formatted_address}
                                </p> */}
                            </a>
                        </li>
                        {addressResult.map(each => (
                            <li
                                className="list-item d-flex align-items-center py-2"
                                key={each.place_id}
                            >
                                <div className="mr-2">
                                    <FI icon={"map-pin"}></FI>
                                </div>{" "}
                                <a
                                    href="#"
                                    onClick={e =>
                                        selectAddress(each, currentFocus, e)
                                    }
                                    className="d-block address-item flex-grow-1"
                                >
                                    <h6 className="font-weight-bold">
                                        {each.name}
                                    </h6>
                                    <p className="text-muted">
                                        {each.formatted_address}
                                    </p>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section id="locationSummary" className="px-3 pt-3 pb-4">
                <section className="deliverySummary d-flex align-items-center">
                    <h5>N5000.00</h5>
                    <section className="ml-auto">
                        <h5 className="d-inline-block">3.3km</h5> |{" "}
                        <h5 className="d-inline-block">24 mins</h5>
                    </section>
                </section>

                <button className="btn btn-success btn-block">
                    Enter Parcel Details
                </button>
            </section>
        </section>
    );
}
