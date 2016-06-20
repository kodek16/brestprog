#@Test:Solution:AcmSort:O(N*log(N))
#Результаты команды
class Team:
    def __init__(self, name, tasks, penalty):
        self.name = name
        self.tasks = tasks      #решённых задач
        self.penalty = penalty  #штраф

n = int(input())
teams = []
for i in range(n):
    name, tasks, penalty = input().split(' ')   #Имя команды не должно содержать пробелов
    tasks = int(tasks)
    penalty = int(penalty)
    teams.append(Team(name, tasks, penalty))

#В качестве ключа мы используем кортеж из двух элементов: количества решённых
#задач с противоположным знаком (для обратного порядка сортировки), и штрафа.
#Это не самый понятный код, но он достаточно лаконичен, и даже элегантен, когда
#к нему привыкаешь :)
teams.sort(key = lambda x: (-x.tasks, x.penalty))

for team in teams:
    print("%s %d %d" % (team.name, team.tasks, team.penalty))
