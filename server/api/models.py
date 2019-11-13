from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# Create your models here.

class CustomUserManager(BaseUserManager):
	def create_user(self, username, role, password=None):
		"""
		Creates and saves a User with the given email and password.
		"""
		if not username:
			raise ValueError('Users must have an email address')
		
		user = self.model(
			username=username,
			role=role
		)

		user.set_password(password)
		user.save(using=self._db)
		return user


	def create_superuser(self, username, password):
		"""
		Creates and saves a superuser with the given email and password.
		"""
		SuperUser = self.create_user(
			username,
			password=password,
		)
		SuperUser.role='admin'
		SuperUser.save(using=self._db)
		return SuperUser

class CustomUser(AbstractBaseUser, PermissionsMixin):
 	
	ROLES = [
		 ('user', 'user'),
		 ('admin', 'admin'),
		 ('manager', 'manager')
	]
	username = models.CharField(max_length=255, unique=True)
	role = models.CharField(
		max_length=255,
		choices=ROLES,
		default='user',
		blank=True,
	)
	password = models.CharField(max_length=255)

	objects = CustomUserManager()
	
	USERNAME_FIELD = 'username'
	def __str__(self):
		return self.username

	class Meta:
		managed = True


class Entry(models.Model):
	#Date, Distance, Time, User
	date = models.DateField()
	distance = models.FloatField()
	time = models.IntegerField()
	user = models.ForeignKey(
		CustomUser,
		related_name='entries',
		on_delete=models.CASCADE
	)


