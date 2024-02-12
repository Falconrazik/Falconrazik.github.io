from flask import Flask, request, jsonify
import requests
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static')

FINNHUB_API_KEY = "cn4li4hr01qgb8m5oj7gcn4li4hr01qgb8m5oj80"
POLYGON_API_KEY = '8E2QxjugE8Z8HHrjRDL26rb58K0kaej5'

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/search', methods=['GET'])
def search():
    ticker_symbol = request.args.get('symbol')
    if not ticker_symbol:
        return jsonify({"error": "Please fill out this field"}), 400
    
    # Fetch company profile
    company_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={ticker_symbol}&token={FINNHUB_API_KEY}'
    company_response = requests.get(company_url)
    
    company_data = company_response.json()

    return jsonify(company_data)

@app.route('/stock_quote', methods=['GET'])
def stock_quote():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'Stock ticker symbol is required.'}), 400
    
    finnhub_quote_url = f'https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}'
    response = requests.get(finnhub_quote_url)
    if response.status_code != 200:
        # Handle error
        return jsonify({'error': 'Could not retrieve stock data.'}), response.status_code

    return jsonify(response.json())

@app.route('/stock_recommendation', methods=['GET'])
def stock_recommendation():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'Stock ticker symbol is required.'}), 400
    
    finnhub_recommendation_url = f' https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&token={FINNHUB_API_KEY}'
    response = requests.get(finnhub_recommendation_url)
    if response.status_code != 200:
        # Handle error
        return jsonify({'error': 'Could not retrieve stock data.'}), response.status_code

    return jsonify(response.json())

@app.route('/get_company_news')
def get_company_news():
    # Get the stock ticker symbol from the query parameter
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'Stock ticker symbol is required.'}), 400

    # Calculate the date 30 days before today's date
    date_from = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    # Get today's date in YYYY-MM-DD format
    date_to = datetime.now().strftime('%Y-%m-%d')

    # Construct the Finnhub API endpoint
    finnhub_news_url = f'https://finnhub.io/api/v1/company-news?symbol={symbol}&from={date_from}&to={date_to}&token={FINNHUB_API_KEY}'
    
    # Make the request to Finnhub API
    response = requests.get(finnhub_news_url)
    if response.status_code != 200:
        # Handle error
        return jsonify({'error': 'Could not retrieve company news.'}), response.status_code

    # Return the news data as a JSON response
    return jsonify(response.json())

@app.route('/get_stock_chart')
def get_stock_chart():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'Stock ticker is required.'}), 400

    # Calculate 'from' date which is 6 months and 1 day prior to today
    date_from = (datetime.now() - timedelta(days=6*30+1)).strftime('%Y-%m-%d')
    # 'to' date is today's date
    date_to = datetime.now().strftime('%Y-%m-%d')

    # Construct the Polygon.io API endpoint
    polygon_url = f'https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{date_from}/{date_to}?adjusted=true&sort=asc&apiKey={POLYGON_API_KEY}'
    
    # Make the request to Polygon.io API
    response = requests.get(polygon_url)
    if response.status_code != 200:
        return jsonify({'error': 'Could not retrieve stock chart data.'}), response.status_code

    # Return the data as a JSON response
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)