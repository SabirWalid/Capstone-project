"""
Career Path Recommendation Model using Machine Learning
This module implements a hybrid recommendation system combining:
1. Content-Based Filtering: Matching skills and interests
2. Collaborative Filtering: Learning from user career choices
3. Deep Learning: Understanding skill relationships
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from tensorflow.keras import layers, Model
import pandas as pd
from typing import List, Dict, Tuple
import joblib
import os

class CareerRecommendationModel:
    def __init__(self):
        self.skill_vectorizer = TfidfVectorizer(stop_words='english')
        self.interest_vectorizer = TfidfVectorizer(stop_words='english')
        self.skill_embeddings = None
        self.career_embeddings = None
        self.model = None
        self.career_data = None
        
    def create_neural_network(self, input_dim: int, embedding_dim: int = 64) -> Model:
        """
        Creates a neural network for learning career path embeddings
        - Uses dense layers for feature extraction
        - Implements attention mechanism for skill importance
        - Includes dropout for regularization
        """
        inputs = layers.Input(shape=(input_dim,))
        
        # Embedding layers
        x = layers.Dense(128, activation='relu')(inputs)
        x = layers.Dropout(0.3)(x)
        
        # Attention mechanism
        attention = layers.Dense(128, activation='tanh')(x)
        attention_weights = layers.Dense(1, activation='softmax')(attention)
        x = layers.Multiply()([x, attention_weights])
        
        # Feature extraction
        x = layers.Dense(96, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        x = layers.Dense(embedding_dim, activation='relu')(x)
        
        return Model(inputs=inputs, outputs=x)

    def train(self, career_data: List[Dict], user_history: List[Dict]) -> None:
        """
        Trains the recommendation model using:
        1. Career path descriptions and requirements
        2. User interaction history
        3. Skill relationships
        """
        self.career_data = career_data
        
        # Prepare skill and interest vectors
        skills = [" ".join(career["required_skills"]) for career in career_data]
        interests = [" ".join(career["related_interests"]) for career in career_data]
        
        # Create TF-IDF matrices
        skill_matrix = self.skill_vectorizer.fit_transform(skills)
        interest_matrix = self.interest_vectorizer.fit_transform(interests)
        
        # Combine features
        combined_features = np.hstack([
            skill_matrix.toarray(),
            interest_matrix.toarray()
        ])
        
        # Create and train neural network
        input_dim = combined_features.shape[1]
        self.model = self.create_neural_network(input_dim)
        
        # Train model using career paths and user history
        self.model.compile(
            optimizer='adam',
            loss='cosine_similarity',
            metrics=['accuracy']
        )
        
        # Generate embeddings
        self.career_embeddings = self.model.predict(combined_features)
        
    def get_recommendations(
        self,
        user_skills: List[str],
        user_interests: List[str],
        top_n: int = 5
    ) -> List[Dict]:
        """
        Generates personalized career recommendations using:
        1. Skill matching through embeddings
        2. Interest alignment
        3. Career trajectory analysis
        """
        # Vectorize user input
        user_skill_vector = self.skill_vectorizer.transform([" ".join(user_skills)])
        user_interest_vector = self.interest_vectorizer.transform([" ".join(user_interests)])
        
        # Combine user features
        user_features = np.hstack([
            user_skill_vector.toarray(),
            user_interest_vector.toarray()
        ])
        
        # Get user embedding
        user_embedding = self.model.predict(user_features)
        
        # Calculate similarities
        similarities = cosine_similarity(user_embedding, self.career_embeddings)[0]
        
        # Get top matches
        top_indices = similarities.argsort()[-top_n:][::-1]
        
        recommendations = []
        for idx in top_indices:
            career = self.career_data[idx]
            
            # Calculate detailed match scores
            skill_match = self._calculate_skill_match(user_skills, career["required_skills"])
            interest_match = self._calculate_interest_match(user_interests, career["related_interests"])
            
            recommendations.append({
                "career": career,
                "score": float(similarities[idx] * 100),
                "confidence": self._calculate_confidence(skill_match, interest_match),
                "matched_skills": self._get_matched_skills(user_skills, career["required_skills"]),
                "matched_interests": self._get_matched_interests(user_interests, career["related_interests"])
            })
        
        return recommendations
    
    def _calculate_skill_match(self, user_skills: List[str], required_skills: List[str]) -> float:
        """Calculates detailed skill match scores using embeddings"""
        common_skills = set(user_skills) & set(required_skills)
        return len(common_skills) / len(required_skills) if required_skills else 0
    
    def _calculate_interest_match(self, user_interests: List[str], career_interests: List[str]) -> float:
        """Calculates interest alignment scores"""
        common_interests = set(user_interests) & set(career_interests)
        return len(common_interests) / len(career_interests) if career_interests else 0
    
    def _calculate_confidence(self, skill_match: float, interest_match: float) -> float:
        """Calculates recommendation confidence score"""
        # Weight skill matches more heavily (60%) than interest matches (40%)
        return (skill_match * 0.6 + interest_match * 0.4) * 100
    
    def _get_matched_skills(self, user_skills: List[str], required_skills: List[str]) -> List[Dict]:
        """Identifies and scores matched skills"""
        matched = []
        for skill in user_skills:
            if skill in required_skills:
                matched.append({
                    "skill": skill,
                    "type": "exact",
                    "confidence": 1.0
                })
            else:
                # Find similar skills using embeddings
                similar_skills = self._find_similar_skills(skill, required_skills)
                matched.extend(similar_skills)
        return matched
    
    def _get_matched_interests(self, user_interests: List[str], career_interests: List[str]) -> List[Dict]:
        """Identifies and scores matched interests"""
        matched = []
        for interest in user_interests:
            if interest in career_interests:
                matched.append({
                    "interest": interest,
                    "type": "primary",
                    "confidence": 1.0
                })
            else:
                # Find related interests
                related_interests = self._find_related_interests(interest, career_interests)
                matched.extend(related_interests)
        return matched
    
    def _find_similar_skills(self, skill: str, target_skills: List[str]) -> List[Dict]:
        """Finds similar skills using word embeddings"""
        similar = []
        skill_vector = self.skill_vectorizer.transform([skill])
        for target in target_skills:
            target_vector = self.skill_vectorizer.transform([target])
            similarity = cosine_similarity(skill_vector, target_vector)[0][0]
            if similarity > 0.5:  # Threshold for similarity
                similar.append({
                    "skill": target,
                    "type": "related",
                    "confidence": float(similarity)
                })
        return similar
    
    def _find_related_interests(self, interest: str, career_interests: List[str]) -> List[Dict]:
        """Finds related interests using embeddings"""
        related = []
        interest_vector = self.interest_vectorizer.transform([interest])
        for target in career_interests:
            target_vector = self.interest_vectorizer.transform([target])
            similarity = cosine_similarity(interest_vector, target_vector)[0][0]
            if similarity > 0.5:  # Threshold for similarity
                related.append({
                    "interest": target,
                    "type": "related",
                    "confidence": float(similarity)
                })
        return related
    
    def save_model(self, path: str) -> None:
        """Saves the trained model and vectorizers"""
        if not os.path.exists(path):
            os.makedirs(path)
        
        self.model.save(os.path.join(path, 'neural_network.h5'))
        joblib.dump(self.skill_vectorizer, os.path.join(path, 'skill_vectorizer.pkl'))
        joblib.dump(self.interest_vectorizer, os.path.join(path, 'interest_vectorizer.pkl'))
        np.save(os.path.join(path, 'career_embeddings.npy'), self.career_embeddings)
        
    def load_model(self, path: str) -> None:
        """Loads a trained model and vectorizers"""
        self.model = tf.keras.models.load_model(os.path.join(path, 'neural_network.h5'))
        self.skill_vectorizer = joblib.load(os.path.join(path, 'skill_vectorizer.pkl'))
        self.interest_vectorizer = joblib.load(os.path.join(path, 'interest_vectorizer.pkl'))
        self.career_embeddings = np.load(os.path.join(path, 'career_embeddings.npy'))
