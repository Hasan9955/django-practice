from django.shortcuts import render

# Create your views here.

def index(request):

    data = {
        'posts': [
  {
    "userId": 1,
    "id": 1,
    "title": "are or make repel provide blinded except option reprehend",
    "body": "because and undertakes\ntakes upon the objections that follow expeditiously and when\nreprehends the annoyances as which all\nour things are but are things happen to the architect"
  },
  {
    "userId": 1,
    "id": 2,
    "title": "who is being",
    "body": "is things in time of life\nsequent are nothing reprehensible pain blessed those pains neither\nflee flattery pleasure further or nothing annoyance as rejecting\nwho open not debts we can who neither unless nothing"
  },
  {
    "userId": 1,
    "id": 3,
    "title": "she repels troubles as if she were exercising herself or",
    "body": "and just but what right\npleasure blinded all choosing or to\npleasure pains or accusing who is born\nmoles further his hatred and work and wants or"
  },
  {
    "userId": 1,
    "id": 4,
    "title": "he is blind",
    "body": "any and often rejecting pleasure to obtain\nis love but assuming provide things blame\nwho here benefits do not know the thing is held pain and pain itself right\nwho are pleasure things there want"
  },
  {
    "userId": 1,
    "id": 5,
    "title": "they don't know what they hate",
    "body": "repudiation seeks forgiveness but\nothers or flees is but but is\npleasure all we can be pleasures who\nor is held by pain nor"
  },
  {
    "userId": 1,
    "id": 6,
    "title": "I will open them with great pain because",
    "body": "so that the body of these is despised, nothing who provides for the pursuit of\nsoftness for us, something of annoyance,\nperceives and no one from reproaches the accusers, which\npleasure pains will and pain and annoyance"
  }
        ]
    }
    return render(request, 'first_app/index.html', context=data)


def about(request, id):
    return render(request, 'first_app/about.html', {'id' : id})


def contact(request):
    print(request.GET)
    return render(request, 'first_app/contact.html', {'id' : request.GET})