import React, { useEffect } from "react";
import styled from "styled-components";
import { AiFillClockCircle } from "react-icons/ai";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";
import { reducerCases } from "../utils/Constants";

export default function Body({ headerBackground }) {
  const [{ token, selectedPlayListId, selectedPlaylist }, dispatch] =
    useStateProvider();
  useEffect(() => {
    const getInitialPlayList = async () => {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${selectedPlayListId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      //   console.log(response.data);
      const selectedPlaylist = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description.startsWith("<a")
          ? ""
          : response.data.description,
        image: response.data.images[0].url,
        tracks: response.data.tracks.items.map(({ track }) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist) => artist.name),
          image: track.album.images[2].url,
          duration: track.duration_ms,
          album: track.album.name,
          context_uri: track.album.uri,
          track_number: track.track_number,
        })),
      };
      //   console.log(selectedPlaylist);
      dispatch({ type: reducerCases.SET_PLAYLIST, selectedPlaylist });
    };
    getInitialPlayList();
  }, [token, dispatch, selectedPlayListId]);

  const playTrack = async (
    id,
    name,
    artists,
    image,
    context_uri,
    track_number
  ) => {
    const response = await axios.put(
      `https://api.spotify.com/v1/me/player/play`,
      {
        context_uri,
        offset: {
          position: track_number - 1,
        },
        position_ms: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    console.log(response, id);
    if (response.status === 204) {
      const currentlyPlaying = {
        id,
        name,
        artists,
        image,
      };
      dispatch({ type: reducerCases.SET_PLAYING, currentlyPlaying });
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    } else {
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    }
  };
  const msToMinutesAndSeconds = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  return (
    <Container headerBackground={headerBackground}>
      {selectedPlaylist && (
        <>
          <div className="playlist">
            <div className="image">
              <img src={selectedPlaylist.image} alt="selectedplaylist" />
            </div>
            <div className="details">
              <span className="type">PLAYLIST</span>
              <h1 className="title">{selectedPlaylist.name}</h1>
              <p className="description">{selectedPlaylist.description}</p>
            </div>
          </div>
          <div className="list">
            <div className="header__row">
              <div className="col">
                <span>#</span>
              </div>
              <div className="col">
                <span>TITLE</span>
              </div>
              <div className="col">
                <span>ALBUM</span>
              </div>
              <div className="col">
                <span>
                  <AiFillClockCircle />
                </span>
              </div>
            </div>
            <div className="tracks">
              {selectedPlaylist.tracks.map(
                (
                  {
                    id,
                    name,
                    artists,
                    image,
                    duration,
                    album,
                    context_uri,
                    track_number,
                  },
                  index
                ) => {
                  return (
                    <div
                      className="row"
                      key={id}
                      onClick={() =>
                        playTrack(
                          id,
                          name,
                          artists,
                          image,
                          context_uri,
                          track_number
                        )
                      }
                    >
                      <div className="col">
                        <span>{index + 1}</span>
                      </div>
                      <div className="col detail">
                        <div className="image">
                          <img src={image} alt="track" />
                        </div>
                        <div className="info">
                          <span className="name">{name}</span>
                          <span className="artists">{artists.join(", ")}</span>
                        </div>
                      </div>
                      <div className="col">
                        <span className="album">{album}</span>
                      </div>
                      <div className="col ">
                        <span className="time">
                          {msToMinutesAndSeconds(duration)}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  .playlist {
    margin: 0 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    /* @media (max-width: 766px) {
            font-size:10px;
          } */
    .image {
      img {
        height: 15rem;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
        @media (max-width: 540px) {
            height: 10rem;
          }
        @media (max-width: 400px) {
            height: 8rem;
          }
      }
    }
  }
  .details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #e0dede;
    .type {
        @media (max-width: 630px) {
            display: none;
          }
    }
    .title {
      color: white;
      font-size: 4rem;
      @media (max-width: 766px) {
            font-size:16px;
          }
      @media (max-width: 630px) {
            display: none;
          }
    }
    .description {
        @media (max-width: 650px) {
            
            display: none;
          }
    }
  }
  .list {
    .header__row {
      display: grid;
      grid-template-columns: 0.3fr 3fr 2fr 0.1fr;
      color: #dddcdc;
      position: sticky;
      margin: 1rem 0 0 0;
      top: 15vh;
      padding: 1rem 3rem;
      background-color: ${({ headerBackground }) =>
        headerBackground ? "#000000dc" : "none"};
      transition: 0.3s ease-in-out;
      @media (max-width: 800px) {
        display: none;
      }
      /* @media (max-width: 540px) {
          width: 100%;
      } */
    }
    .tracks {
      margin: 0 2rem;
      display: flex;
      flex-direction: column;
      margin-bottom: 5rem;
    }
    .row {
      padding: 0.5rem 1rem;
      display: grid;
      grid-template-columns: 0.3fr 3.1fr 2.1fr 0.1fr;
      cursor: pointer;
      @media (max-width: 880px) {
        gap: 20px;
      }
      @media (max-width: 540px) {
          gap:0;
      }
      @media (max-width: 540px) {
          margin-left: -40px;
      }
      /* @media (max-width: 600px) {
        grid-template-columns: 1/2fr 2fr;
      } */

      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }
     
      }
      .col {
        display: flex;
        align-items: center;
        color: #dddcdc;
        img {
          height: 40px;
          
            @media (max-width: 540px) {
          height: 10px;
      }
        }
        .album {
            @media (max-width: 600px) {
            display: none;
          }
        }
        .time {
          @media (max-width: 660px) {
            display: none;
          }
        }
      }
      .detail {
        display: flex;
        gap: 1rem;
         
        }
        .info {
          display: flex;
          flex-direction: column;
        }

        /* .artists {
          background-color: red;
          display: flex;
          flex-direction: row;
          gap: 1rem;
        } */
      }
    }
  }
`;
