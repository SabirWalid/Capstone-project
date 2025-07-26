"""
Career Model Training Script
This script:
1. Loads career data and user history
2. Trains the ML model
3. Saves the trained model for production use
"""

import pandas as pd
import json
from career_model import CareerRecommendationModel
import os

def load_career_data():
    """Load and preprocess career path data"""
    # TODO: Replace with your actual data loading logic
    career_data = [
        {
            "id": "1",
            "title": "Machine Learning Engineer",
            "required_skills": ["Python", "TensorFlow", "Mathematics", "Data Analysis"],
            "related_interests": ["AI", "Machine Learning", "Data Science"],
            "description": "Develops AI and machine learning systems"
        },
        {
            "id": "2",
            "title": "Full Stack Developer",
            "required_skills": ["JavaScript", "Python", "React", "Node.js"],
            "related_interests": ["Web Development", "Programming", "UI/UX"],
            "description": "Builds web applications end-to-end"
        },
        # Add more career paths...
    ]
    return career_data

def load_user_history():
    """Load historical user interaction data"""
    # TODO: Replace with your actual user history loading logic
    user_history = [
        {
            "user_id": "1",
            "skills": ["Python", "Data Analysis"],
            "interests": ["AI", "Machine Learning"],
            "chosen_career": "Machine Learning Engineer"
        },
        # Add more user history...
    ]
    return user_history

def main():
    print("Loading career and user data...")
    career_data = load_career_data()
    user_history = load_user_history()
    
    print("Initializing recommendation model...")
    model = CareerRecommendationModel()
    
    print("Training model...")
    model.train(career_data, user_history)
    
    # Test the model
    test_skills = ["Python", "Data Analysis"]
    test_interests = ["AI", "Machine Learning"]
    
    print("\nTesting model with sample input:")
    print(f"Skills: {test_skills}")
    print(f"Interests: {test_interests}")
    
    recommendations = model.get_recommendations(test_skills, test_interests)
    
    print("\nSample Recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['career']['title']}")
        print(f"   Score: {rec['score']:.1f}%")
        print(f"   Confidence: {rec['confidence']:.1f}%")
        print("   Matched Skills:", [m['skill'] for m in rec['matched_skills']])
        print("   Matched Interests:", [m['interest'] for m in rec['matched_interests']])
    
    # Save the trained model
    print("\nSaving model...")
    model_path = "trained_model"
    model.save_model(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    main()
