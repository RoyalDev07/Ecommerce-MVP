from django.test import TestCase
from api.models import CustomUser
from api.models import Entry

class CustomUserTestCase(TestCase):
    def setUp(self):
        CustomUser.objects.create_user("test_user1", "user")
        # Animal.objects.create(name="lion", sound="roar")
        # Animal.objects.create(name="cat", sound="meow")
        
    def test_user_creation(self):
        test_user1 = CustomUser.objects.get(username="test_user1")
        self.assertEqual(test_user1.username, 'test_user1')
        # """Animals that can speak are correctly identified"""
        # lion = Animal.objects.get(name="lion")
        # cat = Animal.objects.get(name="cat")
        # self.assertEqual(lion.speak(), 'The lion says "roar"')
        # self.assertEqual(cat.speak(), 'The cat says "meow")'  