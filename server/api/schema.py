#define schema
#define type
#define query
#define input
import graphene
from graphene_django.types import DjangoObjectType

from api.models import Entry
from django.contrib.auth import get_user_model
User = get_user_model()

class UserType(DjangoObjectType):
    class Meta:
        model = User

class EntryType(DjangoObjectType):
    class Meta:
        model = Entry

class Query(object):
    all_users = graphene.List(UserType)
    all_entries = graphene.List(EntryType)

    def resolve_all_entries(self, info, **kwargs):
        return Entry.objects.all()

    def resolve_all_users(self, info, **kwargs):
        # We can easily optimize query count in the resolve method
        return User.objects.all()

class CreateUser(graphene.Mutation):
    class Arguments:
        username = graphene.String()
        password = graphene.String()
        role = graphene.String()
    
    user = graphene.Field(UserType)
    ok = graphene.Boolean()
    
    def mutate(self, info, username, password, role):
        user = User(
            username=username,
            role=role
        )
        user.set_password(password)
        user.save()
        ok = True
        return CreateUser(user=user, ok=ok)