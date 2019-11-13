from rest_framework import serializers
from api.models import Entry
from django.contrib.auth import get_user_model
User = get_user_model()
from datetime import date

def isOutDate(value):
	if value > date.today():
		raise serializers.ValidationError('Plese input valid Date!')

class EntrySerializer(serializers.ModelSerializer):
	date = serializers.DateField(validators=[isOutDate])

	class Meta:
		model = Entry
		fields = ('id', 'date', 'distance', 'time', 'user')
		

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('username', 'password', 'role', 'id')

	def create(self, validated_data):
		user = User(
			username = validated_data['username'],
			role=validated_data['role']
		)
		user.set_password(validated_data['password'])
		user.save()

		return user

	def update(self, instance, validated_data):
		instance.username = validated_data['username']
		instance.role=validated_data['role']
		instance.save()

		return instance

