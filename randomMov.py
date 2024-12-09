from flask import Flask, jsonify
import random
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

# URL containing the top movies
URL = 'https://editorial.rottentomatoes.com/guide/best-movies-of-all-time/'

def fetch_movies():
    """
    Scrapes the Rotten Tomatoes webpage to fetch a list of top movies.
    Returns:
        final_list (list): List of movie titles.
    """
    response = requests.get(URL)
    if response.status_code != 200:
        raise Exception("Failed to fetch movie data.")
    
    html = response.text
    soup = BeautifulSoup(html, 'html.parser')
    movie_sections = soup.select('table.aligncenter')  # Assumes tables contain movie data

    # Extract text from each section and combine into a single list
    total_movie_list = []
    for section in movie_sections:
        movies = section.text.split()
        total_movie_list.extend(movies)

    # Process movie list to remove unwanted elements (rank, rating, date)
    processed_movies = []
    rank = 1
    temp = ""
    i = 0
    while i < len(total_movie_list):
        if total_movie_list[i] == f"{rank}.":
            rank += 1
            i += 2  # Skip rank and rating
            if temp:  # Add previous movie title
                processed_movies.append(temp.strip())
                temp = ""
        elif total_movie_list[i][0] == "(" and temp:
            processed_movies.append(temp.strip())
            temp = ""
            i += 1  # Skip date
        else:
            temp += total_movie_list[i] + " "
            i += 1

    return processed_movies

def get_random_movie():
    """
    Fetches the list of movies and selects one at random.
    Returns:
        str: Random movie title.
    """
    try:
        movies = fetch_movies()
        if not movies:
            raise Exception("Movie list is empty.")
        return random.choice(movies)
    except Exception as e:
        print(f"Error fetching random movie: {e}")
        return "Error fetching movie"

@app.route('/random-movie', methods=['GET'])
def random_movie_endpoint():
    """
    Endpoint to return a random movie.
    Returns:
        JSON: A JSON response containing a random movie title.
    """
    movie = get_random_movie()
    return jsonify({"movie": movie})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006)  # Port 5006 for the microservice
