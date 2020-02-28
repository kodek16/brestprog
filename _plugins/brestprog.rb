module Brestprog
  class RegionalsGenerator < Jekyll::Generator
    def generate(site)
      site.data['dynamic'] ||= {}
      site.data['dynamic']['participants'] = ParticipantsData.new(site)
      site.data['dynamic']['schools'] = SchoolsData.new(
        site, site.data['dynamic']['participants'])

      site.data['contests']['regionals'].each do |year, results|
        results.each_key do |region|
          site.pages << RegionalsResultsPage.new(site, site.source, region, year)
        end
      end

      site.data['contests']['nationals'].each_key do |year|
        site.pages << NationalsResultsPage.new(site, site.source, year)
      end

      site.data['dynamic']['participants'].all.each_value do |participant|
        site.pages << ParticipantProfilePage.new(site, site.source, participant)
      end

      site.data['dynamic']['schools'].all.each_value do |school|
        site.pages << SchoolProfilePage.new(site, site.source, school)
      end
    end
  end

  module EntityCollection
    def all
      unless defined?(@all)
        @all = @site.data[@collection].each_with_object({}) do |(_, entity), acc|
          acc[entity['id']] = entity
        end
      end
      @all
    end

    def [](id)
      all[id]
    end
  end

  class ParticipantsData
    include EntityCollection

    def initialize(site)
      @site = site
      @collection = 'participants'

      site.data['contests']['regionals'].each do |year, all_results|
        all_results.each do |region, results|
          results['results'].each do |entry|
            participant = self[entry['participant']]
            participant['results'] ||= {}
            participant['results']['regionals'] ||= {}
            participant['results']['regionals'][year] = entry
            participant['results']['regionals'][year]['region'] = region
          end
        end
      end

      site.data['contests']['nationals'].each do |year, results|
        results['results'].each do |entry|
          participant = self[entry['participant']]
          participant['results'] ||= {}
          participant['results']['nationals'] ||= {}
          participant['results']['nationals'][year] = entry
        end
      end

      all.each_value do |participant|
        for level in ['regionals', 'nationals']
          if participant['results'].has_key? level
            participant['results'][level] = (
              participant['results'][level].sort.reverse!.to_h)
          end
        end
      end
    end
  end

  class SchoolsData
    include EntityCollection

    def initialize(site, participants)
      @site = site
      @collection = 'schools'

      site.data['contests']['nationals'].each do |year, results|
        results['results'].each do |entry|
          participant = participants[entry['participant']]
          reg_result = participant.dig('results', 'regionals', year)

          if reg_result
            school = self[reg_result['school']]
            school['results'] ||= {}
            school['results'][year] ||= {}
            school['results'][year][entry['participant']] ||= {}
            school['results'][year][entry['participant']]['national'] = entry
          end
        end
      end

      site.data['contests']['regionals'].each do |year, all_results|
        all_results.each do |region, results|
          results['results'].each do |entry|
            school = self[entry['school']]
            school['results'] ||= {}
            school['results'][year] ||= {}
            school['results'][year][entry['participant']] ||= {}
            school['results'][year][entry['participant']]['regional'] = entry
          end
        end
      end

      all.each_value do |school|
        school['results'] = school['results'].sort.reverse!.to_h
      end
    end
  end

  module DynamicDataPage
    def participants
      @site.data['dynamic']['participants']
    end

    def schools
      @site.data['dynamic']['schools']
    end
  end

  class ResultsPage < Jekyll::Page
    include DynamicDataPage

    def format_score(score)
      if score % 100 == 0
        (score / 100).to_s
      else
        ('%.2f' % (score / 100.0)).sub('.', ',')
      end
    end
  end

  class RegionalsResultsPage < ResultsPage
    REGION_CONTEST_NAMES = {
      'brest' => 'Брест, областная олимпиада',
      'viciebsk' => 'Витебск, областная олимпиада',
      'homiel' => 'Гомель, областная олимпиада',
      'hrodna' => 'Гродно, областная олимпиада',
      'minsk-voblasc' => 'Минская областная олимпиада',
      'mahiliou' => 'Могилёв, областная олимпиада',
      'minsk-horad' => 'г. Минск, городская олимпиада',
      'licej-bdu' => 'Лицей БГУ, третий этап республиканской олимпиады',
    }

    INCOMPLETE_RESULTS = [
    ]

    def initialize(site, base, region, year)
      @site = site
      @base = base
      @dir = "results/#{region}"
      @name = "#{year}.html"

      results = self.collect_results(site, region, year)
      has_task_breakup = results[0].has_key? 'tasks'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'results_page.html')

      self.data['schools'] = self.schools.all

      self.data['wide'] = has_task_breakup
      self.data['title'] = "#{REGION_CONTEST_NAMES[region]}, #{year}"
      self.data['level'] = 'regional'
      self.data['results'] = results
      self.data['has_task_breakup'] = has_task_breakup
      self.data['incomplete'] = INCOMPLETE_RESULTS.include? [region, year.to_i]
    end

    def collect_results(site, region, year)
      raw = site.data['contests']['regionals'][year][region]['results']

      raw.map do |entry|
        {
          'rank' => entry['rank'],
          'qualified' => entry['qualified'],
          'award' => entry['award'],
          'grade' => entry['grade'],
          'college' => entry['college'],
          'participant' => participants[entry['participant']],
          'school' => schools[entry['school']],
          'tasks' => (entry['tasks'].map(&method(:format_score)) if entry['tasks']),
          'total' => format_score(entry['total']),
        }.compact
      end
    end
  end

  class NationalsResultsPage < ResultsPage
    def initialize(site, base, year)
      @site = site
      @base = base
      @dir = "results/national"
      @name = "#{year}.html"

      results = self.collect_results(site, year)

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'results_page.html')

      self.data['wide'] = true
      self.data['title'] = "Республиканская олимпиада, #{year}"
      self.data['level'] = 'national'
      self.data['results'] = results
      self.data['has_task_breakup'] = true
    end

    def collect_results(site, year)
      puts year
      site.data['contests']
      site.data['contests']['nationals']
      site.data['contests']['nationals'][year]
      site.data['contests']['nationals'][year]['results']
      raw = site.data['contests']['nationals'][year]['results']

      raw.map do |entry|
        {
          'rank' => entry['rank'],
          'qualified' => entry['qualified'],
          'award' => entry['award'],
          'grade' => entry['grade'],
          'college' => entry['college'],
          'participant' => participants[entry['participant']],
          'region' => entry['region'],
          'tasks' => entry['tasks'].map(&method(:format_score)),
          'total' => format_score(entry['total']),
        }.compact
      end
    end
  end

  class ParticipantProfilePage < Jekyll::Page
    include DynamicDataPage

    def initialize(site, base, participant)
      @site = site
      @base = base
      @dir = "participants"
      @name = "#{participant['id']}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'participant_profile.html')

      self.data['schools'] = self.schools.all
      self.data['participant'] = participant

      reg_results = participant['results']['regionals']
      if not reg_results.nil?
        best_result_regionals = reg_results.min_by { |_, x| x['rank'] }
        most_recent_school = reg_results.first[1]['school']
      else
        best_result_regionals = nil
        most_recent_school = nil
      end

      nat_results = participant['results']['nationals']
      if not nat_results.nil?
        best_result_nationals = nat_results.min_by { |_, x| x['rank'] }
      else
        best_result_nationals = nil
      end

      results = {}
      if reg_results
        reg_results.each do |year, result|
          results[year] ||= {}
          results[year]['regional'] = result
        end
      end
      if nat_results
        nat_results.each do |year, result|
          results[year] ||= {}
          results[year]['national'] = result
        end
      end
      results = results.sort.reverse!.to_h

      self.data['school'] = most_recent_school
      self.data['best_result_regionals'] = best_result_regionals
      self.data['best_result_nationals'] = best_result_nationals
      self.data['results'] = results
      self.data['has_regional'] = !reg_results.nil?
      self.data['has_national'] = !nat_results.nil?
    end
  end

  class SchoolProfilePage < Jekyll::Page
    include DynamicDataPage

    def initialize(site, base, school)
      @site = site
      @base = base
      @dir = "schools"
      @name = "#{school['id']}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'school_profile.html')

      self.data['participants'] = self.participants.all
      self.data['school'] = school
    end
  end
end
