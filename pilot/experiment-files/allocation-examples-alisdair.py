import random

# first way

def allocate_cut_the_cake():
    allocation = {
        "A": 0,
        "B": 0,
        "C": 0
    }

    available = 70

    keys = list(allocation.keys())
    random.shuffle(keys)

    for k in keys[:-1]:
        allocation[k] = random.randint(0,available)
        available -= allocation[k]

    allocation[keys[-1]] = available

    return allocation

def allocate_share_out():

    allocation = {
        "A": 0,
        "B": 0,
        "C": 0
    }

    available = 70

    keys = list(allocation.keys())

    for _ in range(available):
        allocation[random.choice(keys)] += 1

    return allocation

if __name__ == "__main__":
    print(allocate_share_out())