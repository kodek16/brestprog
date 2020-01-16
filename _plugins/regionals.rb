module Brestprog
  class RegionalsGenerator < Jekyll::Generator
    def generate(site)
      site.data['dynamic'] ||= {}
      site.data['dynamic']['participants'] = ParticipantsData.new(site)
      site.data['dynamic']['schools'] = SchoolsData.new(site)

      site.data['contests']['regionals'].each_key do |year|
        site.pages << RegionalsResultsPage.new(site, site.source, 'results/brest', year)
      end
    end
  end

  module EntityCollection
    def all
      unless defined?(@all)
        @all = @site.data[@collection].each_with_object({}) do |(_, participant), acc|
          acc[participant['id']] = participant
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
    end
  end

  class SchoolsData
    include EntityCollection

    def initialize(site)
      @site = site
      @collection = 'schools'
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

  class RegionalsResultsPage < Jekyll::Page
    include DynamicDataPage

    def initialize(site, base, dir, year)
      @site = site
      @base = base
      @dir = dir
      @name = "#{year}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'results_page.html')
      self.data['title'] = 'Брест, областная олимпиада, %s' % year
      self.data['results'] = self.collect_results(site, year)
    end

    def collect_results(site, year)
      raw = site.data['contests']['regionals'][year]['brest']['results']

      raw.map do |entry|
        {
          'rank' => entry['rank'],
          'qualified' => entry['qualified'],
          'award' => entry['award'],
          'grade' => entry['grade'],
          'college' => entry['college'],
          'participant' => participants[entry['participant']],
          'school' => schools[entry['school']],
          'tasks' => entry['tasks'].map(&method(:format_score)),
          'total' => format_score(entry['total']),
        }
      end
    end

    def format_score(score)
      if score % 100 == 0
        (score / 100).to_s
      else
        ('%.2f' % (score / 100.0)).sub('.', ',')
      end
    end
  end
end
