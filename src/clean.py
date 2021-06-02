import csv

with open('hate_crime.csv') as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=',')
	line_count = 0
	titles = []
	with open('cleaned_data.csv', mode='w') as cleaned_file:
		cleaned_writer = csv.writer(cleaned_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
		for row in csv_reader:
			if line_count == 0:
				titles = row
				line_count += 1
				cleaned_writer.writerow(row)
			else: 
				if int(row[1])>=2000:
					cleaned_writer.writerow(row)

