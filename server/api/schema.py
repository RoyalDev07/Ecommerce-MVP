#define schema
#define type
#define query
#define input
import graphene
from graphene import ObjectType
import django_filters
from graphene import relay
from graphene_django.filter import DjangoFilterConnectionField
from graphene_django.types import DjangoObjectType
from datetime import date
from api.models import Entry
from django.contrib.auth import get_user_model
from django.db.models import Sum

User = get_user_model()

class ReportType(ObjectType):
    total_distance = graphene.Int()
    total_time = graphene.Int()

class UserType(DjangoObjectType):
    class Meta:
        model = User

class EntryFilter(django_filters.FilterSet):
    # Do case-insensitive lookups on 'name'

    date = django_filters.NumberFilter()
    from_date = django_filters.DateFilter(field_name='date', lookup_expr='gt')
    to_date = django_filters.DateFilter(field_name='date', lookup_expr='lt')

    class Meta:
        model = Entry
        fields = ['user', 'date']

    @property
    def qs(self):
        # The query context can be found in self.request.
        user = self.request.user
        if user.role == 'user':
            return super(EntryFilter, self).qs.filter(user=self.request.user)
        else :
            return super(EntryFilter, self).qs

class EntryInterface(graphene.Interface):
    id = graphene.ID(required = True)
    distance = graphene.String(required = True)

class EntryType(DjangoObjectType):
    pk = graphene.String(source='pk')
    class Meta:
        filterset_class = EntryFilter
        model = Entry
        interfaces = (relay.Node, )

class Query(ObjectType):
    all_users = graphene.List(UserType)
    all_entries = DjangoFilterConnectionField(EntryType)
    current_user = graphene.Field(UserType, id=graphene.Int(), name=graphene.String(), role=graphene.String())
    user = graphene.Field(UserType,id=graphene.Int())
    entry = graphene.Field(EntryType,id=graphene.Int())
    weekly_report = graphene.Field(ReportType)

    def resolve_all_entries(self, info, **kwargs):

        return Entry.objects.all()

    def resolve_all_users(self, info, **kwargs):
        # We can easily optimize query count in the resolve method
        return User.objects.all()

    def resolve_current_user(self, info, **kwargs):
        username = info.context.user
        return User.objects.get(username=username)

    def resolve_user(self, info, **kwargs):
        user = info.context.user
        if user.is_anonymous:
            raise Exception('Not logged in!')
        
        id = kwargs.get('id')
        if id is not None:
            return User.objects.get(pk=id)

        return None

    def resolve_entry(self, info, **kwargs):
        user = info.context.user
        if user.is_anonymous:
            raise Exception('Not logged in!')
        
        id = kwargs.get('id')
        if id is not None:
            return Entry.objects.get(pk=id)

        return None
    
    def resolve_weekly_report(self, info, **kwargs):
        weekNumber = kwargs.get('week_number', None)
        if weekNumber is None:
            weekNumber = date.today().isocalendar()[1]

        queryset = Entry.objects.filter(date__week=weekNumber)
        print (queryset)

        report_data = queryset.aggregate(total_distance=Sum('distance'), total_time=Sum('time'))
        return report_data
#    def resolve_user(self, )

class CreateUser(graphene.Mutation):
    class Arguments:
        username = graphene.String()
        password = graphene.String()
        role = graphene.String()
        id = graphene.Int()

    user = graphene.Field(UserType)
    ok = graphene.Boolean()
    
    def mutate(self, info, username, password, role, **kwargs):
        id = kwargs.get('id')
        if id is not None:
            user = User.objects.get(pk=id)
            user.username = username
            user.role = role
        else :
            user = User(
                username=username,
                role=role
            )
        user.set_password(password)
        user.save()
        ok = True
        return CreateUser(user=user, ok=ok)

class CreateEntry(graphene.Mutation):
    class Arguments:
        user = graphene.String()
        time = graphene.Int()
        distance = graphene.Int()
        date = graphene.types.datetime.Date()
        id = graphene.Int()
    
    entry = graphene.Field(EntryType)

    def mutate(self, info, date, distance, time, **kwargs):
        id = kwargs.get('id')

        if id is not None:
            entry = Entry.objects.get(pk=id)
            entry.date = date
            entry.distance = distance
            entry.time = time
        else:
            username = kwargs.get('user')
            user = User.objects.get(username=username).id
            entry = Entry(
                user=User.objects.get(pk=user),
                date=date,
                distance=distance,
                time=time
            )
        entry.save();
        ok = True
        return CreateEntry(entry=entry)

class DeleteEntry(graphene.Mutation):
    class Arguments:
        id = graphene.Int()
    
    ok = graphene.Boolean()

    def mutate(self, info, **kwargs):
        id = kwargs.get('id')

        entry = Entry.objects.get(pk=id)
        entry.delete()
        ok = True
        return DeleteEntry(ok=ok)


class DeleteUser(graphene.Mutation):
    class Arguments:
        username = graphene.String()
        password = graphene.String()
        role = graphene.String()
        id = graphene.Int()

    user = graphene.Field(UserType)
    ok = graphene.Boolean()
    
    def mutate(self, info, username, password, role, **kwargs):
        id = kwargs.get('id')
        if id is not None:
            user = User.objects.get(pk=id)
            user.username = username
            user.role = role
        else :
            user = User(
                username=username,
                role=role
            )
        user.set_password(password)
        user.save()
        ok = True
        return CreateUser(user=user, ok=ok)
